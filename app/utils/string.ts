export function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function titleCased(str: string) {
  return str.toLowerCase().split(` `).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(` `)
}

export function sentenceCased(str: string) {
  return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1)
}
