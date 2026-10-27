import * as yup from 'yup'

function emptyToNull(value: unknown) {
  return typeof value === 'string' && value.trim() === '' ? null : value
}

export function normalizeWebsite(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const tenantIdentitySchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Nama bimbel minimal 2 karakter.')
    .max(150, 'Nama bimbel maksimal 150 karakter.')
    .required('Nama bimbel wajib diisi.'),
  whatsappNumber: yup
    .string()
    .trim()
    .transform(emptyToNull)
    .nullable()
    .max(20, 'Nomor telepon maksimal 20 karakter.'),
  email: yup
    .string()
    .trim()
    .lowercase()
    .transform(emptyToNull)
    .nullable()
    .email('Masukkan email yang valid.')
    .max(150, 'Email maksimal 150 karakter.'),
  websiteUrl: yup
    .string()
    .trim()
    .transform(emptyToNull)
    .nullable()
    .max(500, 'Website maksimal 500 karakter.')
    .test('http-url', 'Masukkan website HTTP(S) yang valid.', (value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return (
          ['http:', 'https:'].includes(url.protocol) &&
          url.hostname.includes('.') &&
          !url.username &&
          !url.password
        )
      } catch {
        return false
      }
    }),
  address: yup
    .string()
    .trim()
    .transform(emptyToNull)
    .nullable()
    .max(5000, 'Alamat maksimal 5000 karakter.'),
})
