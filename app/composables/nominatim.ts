import type { Location } from "~/types/nominatim"

export function useNominatim() {
  const resolveName = async function (name: string) {
    const { data: results, pending, error } = await useFetch<Location[]>(`https://nominatim.openstreetmap.org/search`, {
      query: {
        q: name,
        format: `json`,
      },
    })

    return { results, pending, error }
  }

  return {
    resolveName,
  }
}
