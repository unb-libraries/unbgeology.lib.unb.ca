import { EntityJSONBody } from "layers/base/types/entity"
import { Image as ImageEntity } from "layers/mongo/server/documentTypes/File"
import { type H3Event } from "h3"
import { type Specimen } from "types/specimen"

async function readBodyBase(event: H3Event) {
  const {
    type,
    objectID,
    description,
    images: imageURIs,
    classification,
    measurements,
    date,
    age,
    origin,
    pieces,
    partial,
    portion,
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
    type,
    description,
    classification,
    date,
    pieces,
    partial,
    portion,
    composition,
    status,
  }

  if (objectID && objectID.unb) {
    body.objectID = {
      ...objectID,
      unb: objectID.unb,
    }
  }

  if (imageURIs) {
    body.images = await ImageEntity.findManyByURI(imageURIs)
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

export async function readSpecimenBody(event: H3Event) {
  const { type } = await readBody(event)
  switch (type) {
    case `fossil`: return await readFossilBody(event)
    case `mineral`: return await readMineralBody(event)
    case `rock`: return await readRockBody(event)
    default: return null
  }
}

export async function readFossilBody(event: H3Event) {
  const body = await readBodyBase(event)
  const { classification: classificationURI, portion: portionURI } = body

  if (classificationURI) {
    const classification = Fossilogy.Classification.findByURI(classificationURI)
    if (classification) {
      body.classification = classification
    }
  }

  if (portionURI) {
    const portion = Fossilogy.Portion.findByURI(portionURI)
    if (portion) {
      body.portion = portion
    }
  }

  return body
}

export async function readMineralBody(event: H3Event) {
  const body = await readBodyBase(event)
  const { classification: classificationURI, portion: portionURI } = body

  if (classificationURI) {
    const classification = Mineralogy.Classification.findByURI(classificationURI)
    if (classification) {
      body.classification = classification
    }
  }

  if (portionURI) {
    const portion = Mineralogy.Portion.findByURI(portionURI)
    if (portion) {
      body.portion = portion
    }
  }

  return body
}

export async function readRockBody(event: H3Event) {
  const body = await readBodyBase(event)
  const { classification: classificationURI, portion: portionURI } = body

  if (classificationURI) {
    const classification = Petrology.Classification.findByURI(classificationURI)
    if (classification) {
      body.classification = classification
    }
  }

  if (portionURI) {
    const portion = Petrology.Portion.findByURI(portionURI)
    if (portion) {
      body.portion = portion
    }
  }

  return body
}
