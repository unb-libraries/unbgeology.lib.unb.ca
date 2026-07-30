import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

type StatusUpdate = { errored: number, imported: number, skipped: number }

export function createItemStatusCountUpdate(newStatus: MigrationItemStatus, oldStatus: MigrationItemStatus) {
  const countUpdate: StatusUpdate = { errored: 0, imported: 0, skipped: 0 }
  const setInc = (status: MigrationItemStatus, inc: number) => {
    switch (status) {
      case MigrationItemStatus.IMPORTED: countUpdate.imported += inc; break
      case MigrationItemStatus.SKIPPED: countUpdate.skipped += inc; break
      case MigrationItemStatus.ERRORED: countUpdate.errored += inc; break
    }
  }

  setInc(newStatus, 1)
  setInc(oldStatus, -1)

  return countUpdate
}

function mergeStatusCountUpdates(...updates: StatusUpdate[]) {
  return updates.reduce((whole, partial) => {
    for (const key in partial) {
      whole[key as keyof StatusUpdate] = whole[key as keyof StatusUpdate] + partial[key as keyof StatusUpdate]
    }
    return whole
  })
}

export async function incrementItemStatusCount(migrationID: string, ...updates: StatusUpdate[]) {
  const update = mergeStatusCountUpdates(...updates)
  if (Object.values(update).filter(v => v).length > 0) {
    await Migration.mongoose.model.updateOne({ _id: parseObjectID(migrationID) }, { $inc: update })
  }
}
