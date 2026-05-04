import { type EntityJSON, type EntityJSONList, type File as FileEntity } from "@unb-libraries/nuxt-layer-entity"

export function useFileUpload<T extends FileEntity = FileEntity>(files: File[]): ReturnType<typeof useFetch<EntityJSONList<T>>>
export function useFileUpload<T extends FileEntity = FileEntity>(file: File): ReturnType<typeof useFetch<EntityJSON<T>>>
export function useFileUpload<T extends FileEntity = FileEntity>(fileOrFiles: File | File[]): ReturnType<typeof useFetch<EntityJSON<T>>> | ReturnType<typeof useFetch<EntityJSONList<T>>> {
  const formData = new FormData()
  formData.set(`status`, `persisted`)
  const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
  files.forEach((file) => { formData.append(`files`, file) })

  if (Array.isArray(fileOrFiles) && files.length > 1) {
    return useFetch<EntityJSONList<T>>(`/api/upload`, {
      method: `POST`,
      body: formData,
    }) as ReturnType<typeof useFetch<EntityJSONList<T>>>
  } else {
    return useFetch<EntityJSON<T>>(`/api/upload`, {
      method: `POST`,
      body: formData,
    }) as ReturnType<typeof useFetch<EntityJSON<T>>>
  }
}
