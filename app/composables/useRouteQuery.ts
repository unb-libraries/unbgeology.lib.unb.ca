import { useRouteQuery as _useRouteQuery } from '@vueuse/router'
import type { Ref } from 'vue'
import type { RouteParamValueRaw } from 'vue-router'

type RouteQueryValueRaw = RouteParamValueRaw | string[]

interface RouteQueryOptions<V, R> {
  transform?: ((val: V) => R) | { get?: (value: V) => R, set?: (value: R) => V }
}

export function useRouteQuery<T extends RouteQueryValueRaw = RouteQueryValueRaw, K = T>(name: string, defaultValue?: T, options: RouteQueryOptions<T, K> = {}): Ref<K> {
  return _useRouteQuery(name, defaultValue, {
    ...options,
    route: useRoute(),
    router: useRouter(),
  })
}
