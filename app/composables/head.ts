interface CustomHeadInput {
  title: string
  description: string
  image: string
}

export function useCustomHead(input?: Partial<CustomHeadInput>) {
  const { name: routeName } = useRoute()

  const titleTemplate = (title?: string) => [title, 'Earth Science Collections', 'UNB Libraries'].filter(Boolean).join(' | ')
  const title = input?.title ?? String(routeName !== 'index' ? routeName : '') ?? ''

  const { host, href, protocol } = useRequestURL()
  const siteUrl = `${protocol}//${host}`

  return useHead({
    link: [
      { rel: 'canonical', href }
    ],
    meta: [
      { property: 'og:url', content: href },
      { property: 'og:title', content: titleTemplate(title) },
      input?.image && { property: 'og:image', content: siteUrl + input.image } || {},
      input?.description && { property: 'og:description', content: input.description } || {},
      input?.description && { name: 'description', content: input.description } || {},
    ].filter(m => Object.values(m).length > 0),
    title,
    titleTemplate,
  })
}