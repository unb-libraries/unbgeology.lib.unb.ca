import doiRegex from "doi-regex"

export function useDoi() {
  const pending = ref(false)
  const citation = ref()
  const abstract = ref()
  const error = ref()

  function isDoi(doi: string) {
    return doi.match(/^http(s)?:\/\/doi\.org\/.*/) && doiRegex().test(doi)
  }

  async function resolve(doi: string) {
    const url = doi.replace(`doi:`, `https://doi.org/`)
    if (isDoi(url)) {
      try {
        pending.value = true
        const [cite, abs] = await Promise.all([
          await fetchCitation(url),
          await fetchAbstract(url),
        ])
        citation.value = cite
        abstract.value = abs
        error.value = undefined
      } catch (err: unknown) {
        citation.value = undefined
        abstract.value = undefined
        error.value = err
      }
      pending.value = false
    } else {
      error.value = `${url} is not a valid DOI.`
    }
  }

  async function fetchCitation(url: string) {
    const { data: citation } = await useFetch<string>(url, {
      headers: {
        Accept: `text/x-bibliography`,
      },
    })
    return citation.value ?? ``
  }

  async function fetchAbstract(url: string) {
    const { data: blob } = await useFetch<Blob>(url, {
      headers: {
        Accept: `application/vnd.crossref.unixref+xml`,
      },
    })

    if (blob.value) {
      const xml = await blob.value.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, `application/xml`)
      const abstractNode = doc.querySelector(`abstract`)
      if (abstractNode) {
        return abstractNode.textContent ?? ``
      }
    }

    return ``
  }

  return {
    citation,
    abstract,
    pending,
    error,
    validate: isDoi,
    resolve,
  }
}
