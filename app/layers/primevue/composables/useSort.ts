export default function (options: (string | [string, 1 | 0 | -1])[]) {
  const sortOptions = reactive<[string, 1 | 0 | -1][]>(options.map((option) => {
    if (typeof option === `string`) {
      return [option, 0]
    }
    return option
  }))

  const sortTop = (id: string, direction?: 1 | -1) => {
    const index = sortOptions.findIndex(([i]) => i === id)
    if (index >= 0) {
      sortOptions.unshift(sortOptions.splice(index, 1)[0])
      if (direction) {
        sortOptions[0][1] = direction
      } else if (sortOptions[0][1] === 0) {
        sortOptions[0][1] = 1
      }
    }
  }

  const sortUp = (id: string, direction?: 1 | -1) => {
    const index = sortOptions.findIndex(([i]) => i === id)
    if (index >= 0) {
      sortOptions.splice(index - 1, 0, sortOptions.splice(index, 1)[0])
      if (direction) {
        sortOptions[index - 1][1] = direction
      } else if (sortOptions[index - 1][1] === 0) {
        sortOptions[index - 1][1] = 1
      }
    }
  }

  const sortReverse = (id: string) => {
    const index = sortOptions.findIndex(([i]) => i === id)
    if (sortOptions[index][1] === 0) {
      sortOptions[index][1] = 1
    } else {
      sortOptions[index][1] *= -1
    }
  }

  return {
    options: sortOptions,
    sortTop,
    sortUp,
    sortReverse,
  }
}
