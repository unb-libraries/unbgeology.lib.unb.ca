export default function useSortableList<T>(items: [string, T][]) {
  const list = shallowRef(items)

  function move(id: string, offset: number) {
    const index = list.value.findIndex(([key]) => key === id)
    if (index >= 0 && index + offset >= 0 && index + offset < list.value.length) {
      const resorted = [...list.value]
      const [item] = resorted.splice(index, 1)
      resorted.splice(index + offset, 0, item)
      list.value = resorted
      return resorted.findIndex(([key]) => key === id)
    }
    return -1
  }

  function moveTop(id: string) {
    const index = list.value.findIndex(([key]) => key === id)
    if (index >= 0) {
      return move(id, -index)
    }
    return -1
  }

  function moveBottom(id: string) {
    const index = list.value.findIndex(([key]) => key === id)
    if (index >= 0) {
      return move(id, list.value.length - index - 1)
    }
    return -1
  }

  function moveAheadOf(id: string, targetId: string) {
    const index = list.value.findIndex(([key]) => key === id)
    const targetIndex = list.value.findIndex(([key]) => key === targetId)
    return move(id, targetIndex - index)
  }

  function movePast(id: string, targetId: string) {
    const index = list.value.findIndex(([key]) => key === id)
    const targetIndex = list.value.findIndex(([key]) => key === targetId)
    return move(id, targetIndex - index + 1)
  }

  function get(id: string) {
    return list.value.find(([key]) => key === id)?.[1]
  }

  function keyAt(index: number) {
    return list.value.at(index)?.[0]
  }

  function valueAt(index: number) {
    return list.value.at(index)?.[1]
  }

  function set(id: string, value: T) {
    const index = list.value.findIndex(([key]) => key === id)
    if (index >= 0) {
      list.value[index] = [id, value]
      list.value = [...list.value]
    }
  }

  return {
    list,
    move,
    moveTop,
    moveBottom,
    moveAheadOf,
    movePast,
    get,
    keyAt,
    valueAt,
    set,
  }
}
