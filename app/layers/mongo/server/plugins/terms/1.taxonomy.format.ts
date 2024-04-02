import type { TaxonomyTerm as TaxonomyTermEntity } from "@unb-libraries/nuxt-layer-entity"
import type { TaxonomyTerm as TaxonomyTermDocument } from "../../documentTypes/TaxonomyTerm"

export default defineEntityFormatter<TaxonomyTermEntity, TaxonomyTermDocument>(Term, async (item, { event }) => {
  const { parent: pid, __type, type } = item

  if (__type === TaxonomyTerm.fullName) {
    const fetchParent = async (pid: string) => {
      const { select } = getQueryOptions(event)
      const sparams: string[] = []
      if (select.length < 1) {
        sparams.push(`id`)
      } else {
        const recursiveFields = select.filter(field => field.match(/^parent(\.\*)?$/))
        if (recursiveFields.length > 0 && recursiveFields.filter(field => field.endsWith(`*`)).length > 0) {
          sparams.push(`parent.*`)
        } else if (!recursiveFields.includes(`parent`)) {
          const fields = select
            .filter(field => field.startsWith(`parent.`))
            .map(field => field.replace(`parent.`, ``))
          sparams.push(...fields.map(field => field.split(`.`)[0]))
          sparams.push(...fields.filter(field => field.endsWith(`*`)).map(field => `parent.${field}`))
        }
      }
      return await $fetch(`/api/terms/${pid}`, sparams.length > 0 ? { query: { select: sparams } } : undefined)
    }

    return {
      type: type ? `taxonomy` : undefined,
      parent: pid ? await fetchParent(`${pid}`) : undefined,
    }
  }

  return {}
})
