import { type EntityJSON, type EntityJSONList, type File as FileEntity } from "@unb-libraries/nuxt-layer-entity"

export async function useFileUpload<T extends FileEntity = FileEntity>(files: File[]): Promise<Ref<EntityJSON<T>[]>>
export async function useFileUpload<T extends FileEntity = FileEntity>(file: File): Promise<Ref<EntityJSON<T>[]>>
export async function useFileUpload<T extends FileEntity = FileEntity>(fileOrFiles: File | File[]): Promise<Ref<EntityJSON<T>[]>> {
  const formData = new FormData()
  const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]

  const uploadOne = async (formData: FormData): Promise<EntityJSON<T>> => {
    const body = formData
    body.set(`status`, `persisted`)
    const { data, error } = await useFetch(`/api/upload`, {
      method: `POST`,
      body,
    })
    if (error.value) {
      throw new Error(error.value.message)
    }
    return data!.value as EntityJSON<T>
  }

  const uploadMany = async (formData: FormData): Promise<EntityJSON<T>[]> => {
    const body = formData
    body.set(`status`, `persisted`)
    const { data, error } = await useFetch(`/api/upload`, {
      method: `POST`,
      body,
    })
    if (error.value) {
      throw new Error(error.value.message)
    }
    return (data!.value as EntityJSONList<T>).entities
  }

  files.forEach((file) => { formData.append(`files`, file) })
  if (Array.isArray(fileOrFiles) && files.length > 1) {
    const entities = await uploadMany(formData)
    return ref(entities)
  } else {
    const entity = await uploadOne(formData)
    return ref([entity])
  }
}
