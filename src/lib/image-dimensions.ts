export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const imageUrl = URL.createObjectURL(file)

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(imageUrl)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('Unable to read image'))
    }
    image.src = imageUrl
  })
}
