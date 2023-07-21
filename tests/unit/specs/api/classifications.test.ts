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
    fixture.forEach((item) => {
      const classification = findClassification(classifications, item)
      expect(classification.name).toBe(item.name)
      expect(classification.slug).toBe(item.slug)
      if (item.super) {
        const parent = findByProperty(`slug`, item.super)
        const superClass = findClassification(classifications, parent!)
        expect(classification.super).toMatchObject({
          name: superClass.name,
          slug: superClass.slug,
        })
      }
    })
  })

  test(`POST /api/classifications`, async () => {
    const response = await request(`/api/classifications`, {
      method: `POST`,
      body: JSON.stringify({
        name: `Napoleonite`,
        slug: `napoleonite`,
        super: `diorite`,
      }),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      name: `Napoleonite`,
      slug: `napoleonite`,
      super: {
        name: findByProperty(`slug`, `diorite`)?.name,
        slug: findByProperty(`slug`, `diorite`)?.slug,
      },
    })
  })

  test(`GET /api/classifications/:slug`, async () => {
    const item = fixture[fixture.length - 1]
    const response = await request(`/api/classifications/${item.slug}`)
    const classification = await response.json()

    expect(response.status).toBe(200)
    expect(classification.name).toBe(item.name)
    expect(classification.slug).toBe(item.slug)
    if (item.super) {
      const parent = findByProperty(`slug`, item.super)!
      expect(classification.super).toMatchObject({
        name: parent.name,
        slug: parent.slug,
      })
    }
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
    expect(classification.name).toBe(item.name)
    expect(classification.slug).toBe(item.slug)
    expect(classification.super).toBeUndefined()
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
