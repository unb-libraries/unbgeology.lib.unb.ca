import { TwLightbox } from "#components"

interface LightboxOptions {
  width: number
  height: number
}

export default function useLightbox() {
  const { stackContent, unstackContent } = useModal()
  return {
    setImage(url: string, options?: Partial<LightboxOptions>) {
      const { height, width } = options ?? {}
      stackContent(h(TwLightbox, { src: url, height, width, onClose: unstackContent }))
    },
  }
}
