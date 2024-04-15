import type { Entity } from "~/layers/mongo/types/entity"

type Validator<T = any> = (input: any) => T | Promise<T>
type ConstrainedValidator<T = any> = Validator<T> & { expected: boolean }
class RequiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = `RequiredError`
  }
}

async function validate<T = any, R extends boolean = true>(input: any | undefined, validator: Validator<T>, options?: { required: R }): Promise<R extends true ? T : T | undefined> {
  if (input !== undefined) {
    return await validator(input) as T
  } else if (!options || options.required) {
    throw new RequiredError(`Input must not be undefined.`)
  } else {
    return undefined as R extends true ? T : T | undefined
  }
}

export const require = <T = any>(validator: Validator<T>) => {
  const $return = async (input: any) => await validate(input, validator, { required: true })
  $return.expected = true
  return $return as Validator<T>
}

export const optional = <T = any>(validator: Validator<T>) => {
  const $return = async (input: any) => await validate(input, validator, { required: false })
  $return.expected = false
  return $return as Validator<T | undefined>
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

export function URIMatchValidator<E extends Entity = Entity>(pattern: RegExp) {
  return async (input: any) => await URIValidator<E>(MatchValidator(pattern)(input))
}

export function URIEntityTypeValidator<E extends Entity = Entity>(...type: string[]) {
  return async (input: any) => {
    const entity = await URIValidator<E>(input)
    if (entity && type.includes(entity.type ?? ``)) {
      return entity
    }
    throw new TypeError(`"${input}" must be an entity of type ${type}`)
  }
}

enum Enum {}
export function EnumValidator<E extends typeof Enum>(e: E) {
  return (input: any) => {
    const keys = Object.keys(e).map(key => `${key}`.toUpperCase())
    if (keys.includes(`${input}`.toUpperCase())) {
      return useEnum(e).valueOf(input)
    }
    throw new TypeError(`"${input}" must be any of ${keys.join(`,`)}`)
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

export function ArrayValidator<T = any>(validator: (input: any) => T | Promise<T>, options?: Partial<{ maxLength: number, minLength: number }>) {
  return async (input: T[]) => {
    if (!Array.isArray(input)) {
      throw new TypeError(`"${input}" must be of type array`)
    }

    if (options?.maxLength && input.length > options.maxLength) {
      throw new TypeError(`"${input}" must not exceed ${options.maxLength} items`)
    }

    if (options?.minLength && input.length < options.minLength) {
      throw new TypeError(`"${input}" must not be less than ${options.minLength} items`)
    }

    return await Promise.all(input.map(validator))
  }
}

export function ObjectValidator<T extends object = object>(input: { [K in keyof T]: Validator<T[K]> }) {
  return async (obj: T) => {
    const validated = Object.fromEntries(await Promise.all(Object
      .entries(obj)
      .filter(([key]) => key in input)
      .map(async ([key, value]) => {
        try {
          return [key, await input[key as keyof T](value)]
        } catch (err: unknown) {
          if (err instanceof RequiredError) {
            throw new RequiredError(`"${key}" must not be undefined`)
          }
          throw err
        }
      }))) as T

    const unavailableRequiredKeys = Object
      .entries(input)
      .filter(([path, validator]) => !(path in obj) && (validator as ConstrainedValidator).expected !== false)
      .map(([path]) => path)

    if (unavailableRequiredKeys.length > 0) {
      throw new TypeError(`${unavailableRequiredKeys.join(`,`)} ${unavailableRequiredKeys.length > 1 ? `are` : `is`} required but missing in input.`)
    }
    return validated
  }
}

export function CustomValidator<T = any>(validator: Validator<T>, options?: { message: string }) {
  return (input: any) => {
    if (validator(input)) {
      return input as T
    }
    throw new TypeError(options?.message || `Invalid input: "${input}"`)
  }
}

export async function validateBody<T extends object = object>(body: any, validate: { [K in keyof T]: (input: any) => T[K] | Promise<T[K]> }) {
  return await ObjectValidator<T>(validate)(body)
}
