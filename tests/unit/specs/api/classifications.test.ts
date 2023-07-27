import fetch from "cross-fetch"
import { beforeAll, describe, expect, test } from "vitest"
import fixture from "../../fixtures/api/classifications.json"
import { type Classification } from "../../../../app/server/entityTypes/Classification"

interface InputItem {
  name: string
  slug: string
  super?: string
}

async function request(url: string, options?: RequestInit) {
  return await fetch(`http://localhost:3118${url}`, options)
}

async function seed() {
  await request(`/api/seed/classifications`, { method: `DELETE` })
  await request(`/api/seed/classifications`, { method: `POST`, body: JSON.stringify(fixture) })
}

function findByProperty(key: keyof InputItem, value: any) {
  return fixture.find(item => item[key] === value)
}

function findLeaf(): InputItem {
  return fixture.find(l => !fixture.some(c => c.super === l.slug))!
}

function findClassification(classifications: Classification[], item: InputItem) {
  return classifications.find(c => c.slug === item.slug)!
}

describe(`Classifications API`, () => {
  beforeAll(seed)

  test(`GET /api/classifications`, async () => {
    const response = await request(`/api/classifications`)
    const classifications: Classification[] = await response.json()

    expect(response.status).toBe(200)
    expect(classifications).toHaveLength(fixture.length)
    classifications.forEach((classification) => {
      const item = fixture.find(item => item.slug === classification.slug)
      expect(classification).toMatchObject({
        name: item?.name,
        slug: item?.slug,
        links: {
          self: `/api/classifications/${item?.slug}`,
          super: `/api/classifications/${item?.slug}/super`,
          sub: `/api/classifications/${item?.slug}/sub`,
        },
      })
    })
  })

  test(`POST /api/classifications`, async () => {
    const leaf = findLeaf()
    const response = await request(`/api/classifications`, {
      method: `POST`,
      body: JSON.stringify({
        name: `Napoleonite`,
        slug: `napoleonite`,
        super: leaf.slug,
      }),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      name: `Napoleonite`,
      slug: `napoleonite`,
      links: {
        self: `/api/classifications/napoleonite`,
        super: `/api/classifications/napoleonite/super`,
        sub: `/api/classifications/napoleonite/sub`,
      },
    })
  })

  test(`GET /api/classifications/:slug`, async () => {
    const item = fixture[fixture.length - 1]
    const response = await request(`/api/classifications/${item.slug}`)
    const classification = await response.json()

    expect(response.status).toBe(200)
    expect(classification).toMatchObject({
      name: item?.name,
      slug: item?.slug,
      links: {
        self: `/api/classifications/${item?.slug}`,
        super: `/api/classifications/${item?.slug}/super`,
        sub: `/api/classifications/${item?.slug}/sub`,
      },
    })
  })

  test(`PUT /api/classifications/:slug`, async () => {
    const item = findByProperty(`slug`, findLeaf().super)!
    const response = await request(`/api/classifications/${item.slug}`, {
      method: `PUT`,
      body: JSON.stringify({
        super: ``,
      }),
    })

    const classification = await response.json()
    expect(response.status).toBe(200)
    expect(classification).toMatchObject({
      name: item?.name,
      slug: item?.slug,
      links: {
        self: `/api/classifications/${item?.slug}`,
        super: `/api/classifications/${item?.slug}/super`,
        sub: `/api/classifications/${item?.slug}/sub`,
      },
    })
  })

  test(`DELETE /api/classifications/:slug`, async () => {
    const item = findByProperty(`slug`, findLeaf().super)!

    const { status } = await request(`/api/classifications/${item.slug}`, { method: `DELETE` })
    const response = await request(`/api/classifications`)
    const classifications = await response.json()

    expect(status).toBe(204)
    expect(findClassification(classifications, item)).toBeUndefined()
  })
})
