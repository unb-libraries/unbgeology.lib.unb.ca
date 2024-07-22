interface LightboxOptions {
  width: number
  height: number
}

export default function () {
  const { setContent } = useModal()
  return {
    setImage(url: string, options?: Partial<LightboxOptions>) {
      const img = h(`img`, { src: `${url}${options?.width && options?.height ? `?=${options.width}&h=${options.height}` : ``}` })
      setContent(() => h(`div`, {
        style: {
          height: options?.height ? `${options.height}px` : `100%`,
          width: options?.width ? `${options.width}px` : `100%`,
        },
      }, img))
    },
  }
}
