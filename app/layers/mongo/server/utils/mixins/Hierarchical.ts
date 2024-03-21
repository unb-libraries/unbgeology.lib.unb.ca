import { Schema, type ObjectId, type Model } from "mongoose"

export interface Hierarchical {
  parent: ObjectId
  parentModel: string
  left: number
  right: number
}

interface Node {
  id: ObjectId
  left: number
  right: number
  parent?: Node
}

async function createNode<M = any>(Model: Model<M>, id: ObjectId, left: number, right: number, parentID?: ObjectId): Promise<Node> {
  const getParent = async (pid: ObjectId) => {
    const parent = await Model.findOne().where(`_id`).equals(pid)
    if (!parent) {
      throw new Error(`Parent not found`)
    }
    const [left, right] = [`left`, `right`].map(f => parent.get(f))
    return await createNode(Model, pid, left, right)
  }

  return {
    id,
    left,
    right,
    parent: parentID ? await getParent(parentID) : undefined,
  }
}

async function getBounds(Model: Model<any>, node: Node, sortField?: string) {
  const { id, left, right, parent } = node

  const sibling = parent
    ? await Model.findOne({ parent: parent.id, _id: { $ne: id } }).sort(`-right`)
    : await Model.findOne({ parent: { $exists: false }, _id: { $ne: id } }).sort(`-right`)

  if (sibling) {
    return [sibling.get(`right`) + 1, sibling.get(`right`) + right - left + 1]
  } else if (parent) {
    return [parent.right, parent.right + right - left]
  } else {
    return [1, right - left + 1]
  }
}

async function shiftRightSubtree(Model: Model<any>, node: Node, distance: number) {
  const { id, left, right } = node

  const condition = {
    parentModel: Model.modelName,
    left: { $gte: left },
    right: { $gte: right },
    protected: { $exists: false },
    _id: { $ne: id },
  }

  await Model.updateMany(condition, {
    $inc: {
      left: distance,
      right: distance,
    },
  })
}

async function shiftUpperSubtree(Model: Model<any>, node: Node, distance: number) {
  const { left, right } = node

  const condition = {
    parentModel: Model.modelName,
    left: { $lte: left },
    right: { $gte: right },
    protected: { $exists: false },
  }

  await Model.updateMany(condition, {
    $inc: {
      right: distance,
    },
  })
}

async function shiftOrDeleteLowerSubtree(Model: Model<any>, node: Node, distance?: number) {
  const { left, right } = node

  const condition = {
    parentModel: Model.modelName,
    left: { $gt: left },
    right: { $lt: right },
  }

  if (distance) {
    await Model.updateMany(condition, {
      $inc: {
        left: distance,
        right: distance,
      },
      $set: {
        protected: true,
      },
    }, { strict: false })
  } else {
    await Model.deleteMany(condition)
  }
}

async function unprotect(Model: Model<any>) {
  const condition = {
    parentModel: Model.modelName,
    protected: { $exists: true },
  }

  await Model.updateMany(condition, {
    $unset: {
      protected: 1,
    },
  }, { strict: false })
}

export default defineDocumentSchema<Hierarchical>({
  parent: {
    type: Schema.Types.ObjectId,
    required: false,
    refPath: `parentModel`,
  },
  parentModel: {
    type: Schema.Types.String,
    required: true,
    immutable: true,
    default() {
      return this.model().modelName
    },
  },
  left: {
    type: Schema.Types.Number,
    required: true,
    default: 1,
  },
  right: {
    type: Schema.Types.Number,
    required: true,
    default: 2,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      const Model = this.model()

      const [id, left, right, parentID] = [`_id`, `left`, `right`, `parent`].map(f => this.get(f))
      const node = await createNode(Model, id, left, right, parentID)
      if (!this.isNew) {
        this.$locals.original = node
      }

      const [newLeft, newRight] = await getBounds(Model, node)
      if (newLeft <= left || this.isNew) {
        this.set(`left`, newLeft)
        this.set(`right`, newRight)
      } else {
        this.set(`left`, newLeft - (right - left + 1))
        this.set(`right`, newRight - (right - left + 1))
      }
    })

    schema.post(`save`, async function () {
      const Model = this.model()
      const [id, left, right, parent] = [`_id`, `left`, `right`, `parent`].map(f => this.get(f))

      const original = this.$locals.original as Node | undefined
      if (original) {
        const { left: oLeft } = original
        await shiftOrDeleteLowerSubtree(Model, original, left - oLeft)
        await shiftRightSubtree(Model, original, left - right - 1)
        await shiftUpperSubtree(Model, original, left - right - 1)
      }

      const saved = await createNode(Model, id, left, right, parent)
      await shiftRightSubtree(Model, saved, right - left + 1)
      if (saved?.parent) {
        await shiftUpperSubtree(Model, saved.parent, right - left + 1)
      }
      await unprotect(Model)
    })

    schema.pre(`deleteOne`, { document: true, query: false }, async function () {
      const Model = this.model()
      const [id, left, right, parent] = [`_id`, `left`, `right`].map(f => this.get(f))
      this.$locals.original = await createNode(Model, id, left, right, parent)
    })

    schema.post(`deleteOne`, { document: true, query: false }, async function () {
      const Model = this.model()
      const [left, right] = [`left`, `right`].map(f => this.get(f))

      const original = this.$locals.original as Node
      await shiftOrDeleteLowerSubtree(Model, original)
      await shiftRightSubtree(Model, original, left - right - 1)
      await shiftUpperSubtree(Model, original, left - right - 1)
    })
  },
})
