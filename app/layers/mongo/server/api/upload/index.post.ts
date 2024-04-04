export default defineEventHandler(async (event) => {
  const { files, fields } = event.context.files

  return await $fetch(`/api/files`, {
    method: `POST`,
    body: Object.entries(files ?? [])
      .map(([, files]) => files)
      .flat()
      .filter(file => file)
      .map((file) => {
        const { filepath, size, originalFilename, mimetype } = file!
        return {
          filename: filepath.split(`/`).at(-1),
          filepath,
          filesize: size,
          uploadName: originalFilename,
          mimetype,
          type: mimetype,
        }
      })
      .map((file, index) => {
        Object.entries(fields ?? [])
          .filter(([, values]) => (values ?? []).length > 0)
          .forEach(([field, values]) => {
            // @ts-ignore
            file[field] = values!.length > 1 ? values![index] : values![0]
          })
        return file
      }),
  })
})
