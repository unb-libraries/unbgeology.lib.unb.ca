import { type File, type Entity } from "layers/base/types/entity"

export enum Status {
  CREATED = `created`,
  RUNNING = `running`,
  SUCCEDED = `succeded`,
  FAILED = `failed`,
}

export interface Migration extends Entity {
  name: string
  source: File
  total: number
  status: Status
}
