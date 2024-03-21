import { Schema, type ObjectId, type Model } from "mongoose"
import type { DocumentBase } from "~/layers/mongo/types/schema"

export interface Hierarchical {
  parent: ObjectId
  parentModel: string
  __l: number
  __r: number
}

interface Node {
  id: ObjectId
  left: number
  right: number
  parent?: Node
  sortFieldID?: string
  sortFieldValue?: any
}

async function createNode<M = any>(Model: Model<M>, id: ObjectId, left: number, right: number, parentID?: ObjectId, sortField?: [string, any]): Promise<Node> {
  const getParent = async (pid: ObjectId) => {
    const parent = await Model.findOne().where(`_id`).equals(pid)
    if (!parent) {
      throw new Error(`Parent not found`)
    }
    const [left, right] = [`__l`, `__r`].map(f => parent.get(f))
    return await createNode(Model, pid, left, right)
  }

  return {
    id,
    left,
    right,
    sortFieldID: sortField ? sortField[0] : undefined,
    sortFieldValue: sortField ? sortField[1] : undefined,
    parent: parentID ? await getParent(parentID) : undefined,
  }
}

async function getBounds(Model: Model<any>, node: Node) {
  const { id, left, right, parent, sortFieldID, sortFieldValue } = node

  const query = parent
    ? { parentModel: Model.modelName, parent: parent?.id, _id: { $ne: id } }
    : { parentModel: Model.modelName, parent: { $exists: false }, _id: { $ne: id } }
  const condition = sortFieldID ? { [sortFieldID]: { $lt: sortFieldValue } } : {}

  const siblingsCount = await Model.countDocuments(query)
  const rightmostSibling = await Model
    .findOne({ ...query, ...condition })
    .sort(`-__r`)

  if (rightmostSibling) {
    return [rightmostSibling.get(`__r`) + 1, rightmostSibling.get(`__r`) + right - left + 1]
  } else if (parent && siblingsCount > 0) {
    return [parent.left + 1, parent.left + right - left + 1]
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
    __l: { $gte: left },
    __r: { $gte: right },
    protected: { $exists: false },
    _id: { $ne: id },
  }

  await Model.updateMany(condition, {
    $inc: {
      __l: distance,
      __r: distance,
    },
  })
}

async function shiftUpperSubtree(Model: Model<any>, node: Node, distance: number) {
  const { left, right } = node

  const condition = {
    parentModel: Model.modelName,
    __l: { $lte: left },
    __r: { $gte: right },
    protected: { $exists: false },
  }

  await Model.updateMany(condition, {
    $inc: {
      __r: distance,
    },
  })
}

async function shiftOrDeleteLowerSubtree(Model: Model<any>, node: Node, distance?: number) {
  const { left, right } = node

  const condition = {
    parentModel: Model.modelName,
    __l: { $gt: left },
    __r: { $lt: right },
  }

  if (distance) {
    await Model.updateMany(condition, {
      $inc: {
        __l: distance,
        __r: distance,
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

export default <T extends DocumentBase>(options?: { sort: keyof Omit<T, keyof DocumentBase | keyof Hierarchical> }) => defineDocumentSchema<Hierarchical>({
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
  __l: {
    type: Schema.Types.Number,
    required: true,
    default: 1,
  },
  __r: {
    type: Schema.Types.Number,
    required: true,
    default: 2,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      const Model = this.model()

      const [id, left, right, parentID] = [`_id`, `__l`, `__r`, `parent`].map(f => this.get(f))
      const node = await createNode(Model, id, left, right, parentID, options?.sort ? [String(options.sort), this.get(String(options.sort))] : undefined)
      if (!this.isNew) {
        this.$locals.original = node
      }

      const [newLeft, newRight] = await getBounds(Model, node)
      if (newLeft <= left || this.isNew) {
        this.set(`__l`, newLeft)
        this.set(`__r`, newRight)
      } else {
        this.set(`__l`, newLeft - (right - left + 1))
        this.set(`__r`, newRight - (right - left + 1))
      }
    })

    schema.post(`save`, async function () {
      const Model = this.model()
      const [id, left, right, parent] = [`_id`, `__l`, `__r`, `parent`].map(f => this.get(f))

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
      const [id, left, right, parent] = [`_id`, `__l`, `__r`].map(f => this.get(f))
      this.$locals.original = await createNode(Model, id, left, right, parent)
    })

    schema.post(`deleteOne`, { document: true, query: false }, async function () {
      const Model = this.model()
      const [left, right] = [`__l`, `__r`].map(f => this.get(f))

      const original = this.$locals.original as Node
      await shiftOrDeleteLowerSubtree(Model, original)
      await shiftRightSubtree(Model, original, left - right - 1)
      await shiftUpperSubtree(Model, original, left - right - 1)
    })
  },
})()
