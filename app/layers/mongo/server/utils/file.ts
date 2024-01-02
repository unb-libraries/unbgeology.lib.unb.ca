export function useFileDocumentType(type: string) {
  return type === `image`
    ? ImageFile
    : type === `document`
      ? DocumentFile
      : FileBase
}
