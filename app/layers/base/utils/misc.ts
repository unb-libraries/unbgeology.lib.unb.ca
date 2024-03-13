enum Enumerator {
}

export function useEnum<E extends typeof Enumerator = typeof Enumerator>(e: E) {
  return {
    labelOf(value: keyof E | E[keyof E] | Lowercase<Extract<keyof E, string>>): keyof E {
      if (typeof value === `string`) {
        return value.toLocaleString() as keyof E
      } else {
        return Object
          .keys(e)
          .slice(0, Object.keys(e).length / 2)
          .map(k => parseInt(k))
          .filter(k => (value as number) & k)
          .map(k => e[k])
          .join(`_`) as keyof E
      }
    },

    valueOf(value: keyof E | E[keyof E] | Lowercase<Extract<keyof E, string>>): E[keyof E] {
      return typeof value === `number`
        ? value as E[keyof E]
        : String(value).toUpperCase().split(`_`)
          .reduce((acc, cur, index) => index > 0 ? acc | e[cur as keyof E] as number : e[cur as keyof E] as number, 0) as E[keyof E]
    },

    toTuples: (): [E[keyof E], keyof E][] => Object
      .keys(e)
      .slice(0, Object.keys(e).length / 2)
      .map(k => parseInt(k))
      .map(k => [k, `${e[k]}`.replace(/_/g, ` `)] as [E[keyof E], keyof E]),
  }
}
