export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`render:html`, (html, { event }) => {
    const filename = !event.path.startsWith(`/admin`) ? `admin.css` : `main.css`
    const pattern = new RegExp(`<link .* href=".*/theme.${filename}">\n`)
    html.head = html.head.map(html =>
      html.replace(pattern, ``))
  })
})
