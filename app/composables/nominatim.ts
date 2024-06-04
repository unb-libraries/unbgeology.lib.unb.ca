import type { Location } from "~/types/nominatim"

export function useNominatim() {
  const resolveName = async function (name: string) {
    const { data: results, error } = await useFetch<Location[]>(`https://nominatim.openstreetmap.org/search`, {
      query: {
        q: name,
        format: `json`,
      },
    })

    return { results, error }
  }

  return {
    resolveName,
  }
}
