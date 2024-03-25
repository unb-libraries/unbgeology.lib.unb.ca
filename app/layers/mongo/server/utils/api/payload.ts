import type { Entity } from "~/layers/mongo/types/entity"

interface Validator<T = any> {
  (input: any): T | Promise<T>
  expected?: boolean
}

class RequiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = `RequiredError`
  }
}

function validate<T = any, R extends boolean = true>(input: any | undefined, validator: Validator<T>, options?: { required: R }): R extends true ? T : T | undefined {
  if (input !== undefined) {
    return validator(input) as T
  } else if (!options || options.required) {
    throw new RequiredError(`Input must not be undefined.`)
  } else {
    return undefined as R extends true ? T : T | undefined
  }
}

export const require = <T = any>(validator: Validator<T>) => {
  const $return = (input: any) => validate(input, validator, { required: true })
  $return.expected = true
  return $return
}

export const optional = <T = any>(validator: Validator<T>) => {
  const $return = (input: any) => validate(input, validator, { required: false })
  $return.expected = false
  return $return
}
export const requireIf = <R extends boolean, T = any>(condition: R, validator: Validator<T>) => condition ? require(validator) : optional(validator) as R extends true ? Validator<T> : Validator<T | undefined>

export function StringValidator(input: any) {
  if (typeof input === `string`) {
    return input
  }
  throw new TypeError(`"${input}" must be of type string`)
}

export function MatchValidator(pattern: RegExp) {
  return (input: string) => {
    if (pattern.test(input)) {
      return input
    }
    throw new TypeError(`"${input}" must match pattern ${pattern}`)
  }
}

export async function URIValidator<E extends Entity = Entity>(input: string) {
  try {
    const data = await $fetch(input as string, {
      query: {
        select: `type`,
      },
    })
    if (data) {
      return data as E
    }
  } catch (error) {
    throw new TypeError(`"${input}" must be a valid URI`)
  }
}

export function NumberValidator(input: any) {
  if (typeof input === `number`) {
    return input
  }
  throw new TypeError(`"${input}" must be of type number`)
}

export function BooleanValidator(input: any) {
  if (typeof input === `boolean`) {
    return input
  }
  throw new TypeError(`"${input}" must be of type boolean`)
}

export function ArrayValidator<T = any>(validator: (input: any) => T) {
  return (input: T[]) => {
    if (Array.isArray(input) && input.every(validator)) {
      return input
    }
    throw new TypeError(`"${input}" must be of type array`)
  }
}

export function ObjectValidator<T extends object = object>(input: { [K in keyof T]: Validator<T[K]> }) {
  return (obj: T) => {
    const validated = Object.fromEntries(Object
      .entries(obj)
      .filter(([key]) => key in input)
      .map(([key, value]) => {
        try {
          return [key, input[key as keyof T](value)]
        } catch (err: unknown) {
          if (err instanceof RequiredError) {
            throw new RequiredError(`"${key}" must not be undefined`)
          }
          throw err
        }
      })) as T

    const unavailableRequiredKeys = Object
      .entries(input)
      .filter(([path, validator]) => !(path in obj) && (validator as Validator).expected !== false)
      .map(([path]) => path)

    if (unavailableRequiredKeys.length > 0) {
      throw new TypeError(`${unavailableRequiredKeys.join(`,`)} ${unavailableRequiredKeys.length > 1 ? `are` : `is`} required but missing in input.`)
    }
    return validated
  }
}

export function validateBody<T extends object = object>(body: any, validate: { [K in keyof T]: (input: any) => T[K] | Promise<T[K]> }) {
  return ObjectValidator<T>(validate)(body)
}
