export default function (options: (string | [string, 1 | 0 | -1])[]) {
  const sortOptions = reactive<[string, 1 | 0 | -1][]>(options.map((option) => {
    if (typeof option === `string`) {
      return [option, 0]
    }
    return option
  }))

  const sortBy = (id: string, direction?: 1 | -1) => {
    const index = sortOptions.findIndex(([i]) => i === id)
    sortOptions.unshift(sortOptions.splice(index, 1)[0])
    if (direction) {
      sortOptions[0][1] = direction
    } else if (sortOptions[0][1] === 0) {
      sortOptions[0][1] = 1
    }
  }

  return {
    options: sortOptions,
    sortBy,
  }
}
