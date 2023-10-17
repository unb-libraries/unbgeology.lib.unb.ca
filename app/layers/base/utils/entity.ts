import { UseFetchOptions } from "nuxt/app"
import { type Entity, type EntityList } from "~/layers/base/types/entity"

export const fetchEntityList = async function <E extends Entity> (uri: string, options?: UseFetchOptions<EntityList<E>>) {
  const { data } = await useFetch<EntityList<E>>(uri, options ?? {})
  if (data.value) {
    return reactive(data.value)
  }
  return reactive({
    items: [] as E[],
    nav: {},
    page: 1,
    pageSize: 25,
    totalItems: 0,
  })
}
