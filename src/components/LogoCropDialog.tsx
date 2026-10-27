import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function LogoCropDialog({
  file,
  onCancel,
  onComplete,
  maxBytes = 5 * 1024 * 1024,
}: {
  file: File
  maxBytes?: number
  onCancel: () => void
  onComplete: (file: File) => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageUrl(reader.result)
    }
    reader.onerror = () =>
      setError('File logo tidak dapat dibaca sebagai gambar.')
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  useEffect(() => {
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    dialog?.focus()
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
      if (event.key !== 'Tab' || !dialog) return
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
        ),
      )
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault()
        last?.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === dialog)
      ) {
        event.preventDefault()
        first?.focus()
      }
    }
    dialog?.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      dialog?.removeEventListener('keydown', handleKey)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [onCancel])

  async function handleComplete() {
    if (!imageUrl || !croppedAreaPixels) return

    if (isPending) return
    setIsPending(true)
    try {
      const croppedFile = await createCroppedImageFile(file, croppedAreaPixels)
      if (croppedFile.size > maxBytes) {
        setError(
          `Hasil crop melebihi ukuran maksimum ${maxBytes / (1024 * 1024)} MB.`,
        )
        return
      }
      onComplete(croppedFile)
    } catch {
      setError('Gagal membuat gambar hasil crop. Silakan coba lagi.')
    } finally {
      setIsPending(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-5 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-logo-crop-title"
      >
        <h2 id="tenant-logo-crop-title" className="text-xl font-semibold">
          Atur crop logo
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Geser gambar untuk memilih area logo, lalu gunakan zoom bila
          diperlukan.
        </p>

        <div
          className="relative mt-5 h-80 overflow-hidden rounded-md bg-muted sm:h-96"
          role="group"
          aria-label="Area crop logo"
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            showGrid
            onCropChange={setCrop}
            onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
            onZoomChange={setZoom}
          />
        </div>

        <div className="mt-5 grid gap-2">
          <Label htmlFor="tenant-logo-zoom">Perbesar gambar</Label>
          <input
            id="tenant-logo-zoom"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </div>

        {error ? (
          <p
            className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={!croppedAreaPixels || isPending}
            onClick={() => void handleComplete()}
          >
            Gunakan hasil crop
          </Button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

function createCroppedImageFile(
  sourceFile: File,
  cropArea: Area,
): Promise<File> {
  return createImageBitmap(sourceFile).then(async (image) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(cropArea.width)
      canvas.height = Math.round(cropArea.height)
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is not supported')

      context.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      return await createImageFileFromCanvas(canvas, sourceFile)
    } finally {
      image.close()
    }
  })
}

function createImageFileFromCanvas(
  canvas: HTMLCanvasElement,
  sourceFile: File,
): Promise<File> {
  const outputType =
    sourceFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const extension = outputType === 'image/png' ? 'png' : 'jpg'
  const baseName = sourceFile.name.replace(/\.[^.]+$/, '') || 'logo'

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to create cropped image'))
          return
        }
        resolve(
          new File([blob], `${baseName}-cropped.${extension}`, {
            type: outputType,
          }),
        )
      },
      outputType,
      outputType === 'image/jpeg' ? 0.92 : undefined,
    )
  })
}
