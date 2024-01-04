import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { type H3Event } from "h3"
import { type Specimen, Category } from "types/specimen"

export async function readSpecimenBody(event: H3Event) {
  const {
    category,
    objectID,
    description,
    images: imageURIs,
    classification: classificationURI,
    measurements,
    date,
    age,
    origin,
    pieces,
    partial,
    portion: portionURI,
    composition,
    collector: collectorURI,
    sponsor: sponsorURI,
    loans,
    storage,
    publications,
    status,
    editor: userURI,
  } = await readBody<EntityJSONBody<Specimen>>(event)

  const body: Partial<EntityJSONBody<Specimen>> = {
    category,
    description,
    date,
    pieces,
    partial,
    composition,
    status,
  }

  if (objectID && objectID.unb) {
    body.objectID = {
      ...objectID,
      unb: objectID.unb,
    }
  }

  if (classificationURI) {
    const classification = await getClassificationModel(category)
      .findByURI(classificationURI)
    if (classification) {
      body.classification = classification
    }
  }

  if (imageURIs) {
    body.images = await ImageFile.findManyByURI(imageURIs)
  }
  if (Array.isArray(measurements)) {
    body.measurements = measurements
      .filter(({ width, length }) => width && length)
      .map(({ width, length }) => ({ width, length }))
  }
  if (age) {
    const { relative: unitURI, numeric } = age
    if (unitURI) {
      const unit = await Geochronology.findByURI(unitURI)
      if (unit) {
        body.age = {
          relative: unit,
          numeric,
        }
      }
    }
  }
  if (origin) {
    const { latitude, longitude, accuracy = 0, name, description } = origin
    if (latitude && longitude) {
      body.origin = { latitude, longitude, accuracy, name, description }
    }
  }
  if (portionURI) {
    const portion = await getPortionModel(category)
      .findByURI(portionURI)
    if (portion) {
      body.portion = portion
    }
  }
  if (collectorURI) {
    const collector = await Person.findByURI(collectorURI)
    if (collector) {
      body.collector = `${collector._id}`
    }
  } else if (sponsorURI) {
    const sponsor = await Person.findByURI(sponsorURI)
    if (sponsor) {
      body.sponsor = `${sponsor._id}`
    }
  }
  if (Array.isArray(loans)) {
    body.loans = loans
  }
  if (Array.isArray(storage)) {
    body.storage = []
    for (const item of storage) {
      const { location: locationURI } = item
      item.location = await StorageLocation.findByURI(locationURI)
      body.storage.push(item)
    }
  }
  if (Array.isArray(publications)) {
    body.publications = []
    for (const publication of publications) {
      const { citation, abstract, doi } = publication
      if (citation) {
        body.publications.push({ citation, abstract, doi })
      }
    }
  }
  if (userURI) {
    const editor = await User.findByURI(userURI)
    if (editor) {
      body.editor = `${editor._id}`
    }
  }

  return body
}

export function getClassificationModel(category: Category) {
  switch (category) {
    case Category.FOSSIL: return Fossilogy.Classification
    case Category.MINERAL: return Mineralogy.Classification
    case Category.ROCK: return Petrology.Classification
  }
}

export function getPortionModel(category: Category) {
  switch (category) {
    case Category.FOSSIL: return Fossilogy.Portion
    case Category.MINERAL: return Mineralogy.Portion
    case Category.ROCK: return Petrology.Portion
  }
}
