import { type Specimen, ObjectIDType, type ObjectID } from "types/specimen"

export default defineEventHandler(async (event) => {
  const specimenBody = await readSpecimenBody(event)
  if (!specimenBody.objectIDs) {
    specimenBody.objectIDs = [] as ObjectID[]
  }
  specimenBody.objectIDs.push({
    id: createObjectID(),
    primary: specimenBody.objectIDs.find(({ primary }) => primary) === undefined,
    type: ObjectIDType.INTERNAL,
  })

  const specimen = await Specimen.create(specimenBody)

  return sendEntity<Specimen>(event, specimen)
})
