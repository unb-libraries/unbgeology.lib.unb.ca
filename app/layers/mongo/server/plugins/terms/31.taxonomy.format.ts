import { type TaxonomyTerm } from "@unb-libraries/nuxt-layer-entity"
import { type TaxonomyTerm as MoTaxonomyTerm } from "../../documentTypes/TaxonomyTerm"

type TaxonomyTermQueryResultItem = Omit<MoTaxonomyTerm, `parent`> & { parent?: TaxonomyTermQueryResultItem }

export default defineMongooseFormatter(TaxonomyTerm, async (item, { event }): Promise<Partial<TaxonomyTerm>> => {
  const { parent } = item as TaxonomyTermQueryResultItem

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
    return await $fetch<TaxonomyTerm>(`/api/terms/${pid}`, sparams.length > 0 ? { query: { select: sparams } } : undefined)
  }

  return {
    parent: parent?._id ? await fetchParent(`${parent._id}`) : undefined,
  }
})
