import { type Unit, Division } from "~/types/geochronology"
interface UnitData {
  Name: string
  Parent: string
  Unit: string
  Bounds: string
}

export default defineMigrateHandler<UnitData, Unit>(`Term.Geochronology`, async (item, { migration }) => {
  const { Name: label, Parent: parent, Unit: division, Bounds: bounds } = item
  const [mya, uncertainty] = bounds.split(`+/-`)
  return {
    label,
    type: `geochronology`,
    parent: (parent && await useMigrationLookup(migration, parent)) || undefined,
    division: ((division: string) => {
      switch (division) {
        case `Eon`: return Division.EON
        case `Era`: return Division.ERA
        case `Period`: return Division.PERIOD
        case `Sub-Period`: return Division.SUBPERIOD
        case `Epoch`: return Division.EPOCH
        case `Age`: return Division.AGE
      }
    })(division),
    start: parseFloat(mya.replace(`~`, ``)) * 1000000,
    uncertainty: uncertainty && parseFloat(uncertainty) * 1000000,
    gssp: !mya.startsWith(`~`),
  }
})
