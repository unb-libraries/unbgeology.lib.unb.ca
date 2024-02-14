import { type Enum } from "../types"

export const useEnum = (e: Enum) => ({
  toString: (value: number): string => Object
    .keys(e)
    .slice(0, Object.keys(e).length / 2)
    .map(k => parseInt(k))
    .filter(k => value & k)
    .map(k => e[k])
    .join(`_`),
  toNumber: (value: string) => value
    .toUpperCase()
    .split(`_`)
    .reduce((acc, cur, index) => index > 0 ? acc | e[cur] as number : e[cur] as number, 0),
  toTuples: (labelFn?: (label: string, value: number) => string): [number, string][] => Object
    .keys(e)
    .slice(0, Object.keys(e).length / 2)
    .map(k => parseInt(k))
    .map(k => [k, `${e[k]}`.replace(/_/g, ` `).toLowerCase()] as [number, string])
    .map(([v, l]) => labelFn ? [v, labelFn(l, v)] : [v, l]),
})
