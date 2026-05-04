import { EntityForm } from "#components"

export default function <T = any> (Form: typeof EntityForm, options?: { onSave: (values: T) => void | Promise<void>, onCancel: () => void | Promise<void> }) {
  const { setContent, close } = useModal()

  const onCancel = async () => {
    await options?.onCancel?.()
    close()
  }
  const onSave = async (values: T) => {
    await options?.onSave?.(values)
    close()
  }

  const ModalContent = (values: any, options?: Partial<{ title: string }>) => <div>
    { options?.title ? <h3>{options.title}</h3> : ``}
    <Form {...values} onSave={onSave} onCancel={onCancel} />
  </div>

  const open = (values?: Partial<T>) => setContent(ModalContent(values))

  return {
    open,
    close,
  }
}
