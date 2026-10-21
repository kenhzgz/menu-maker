/**
 * Shrinks a photo from the device gallery and uploads it to Netlify Blobs.
 * Resizing first keeps uploads fast on mobile data.
 */
export async function uploadImage(
  file: File,
  { maxSize = 2160, keepAlpha = false } = {},
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const type = keepAlpha ? 'image/png' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.88),
  )
  if (!blob) throw new Error('No se pudo procesar la imagen')

  const res = await fetch('/api/backgrounds', {
    method: 'POST',
    headers: { 'content-type': type },
    body: blob,
  })
  if (!res.ok) throw new Error('No se pudo subir la imagen')
  const { url } = (await res.json()) as { url: string }
  return url
}
