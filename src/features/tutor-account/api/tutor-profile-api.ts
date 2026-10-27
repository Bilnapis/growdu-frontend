import type { Tutor } from '@/features/tutors/api/tutors-api'
import { apiRequest } from '@/services/api-client'

export type TutorProfileInput = {
  name: string
  phoneNumber: string
  email: string
  address: string
  expertise: string
  education: string
}

export function getTutorProfile(signal?: AbortSignal) {
  return apiRequest<Tutor>('/tutors/me', { signal })
}

export function updateTutorProfile(input: TutorProfileInput) {
  return apiRequest<Tutor>('/tutors/me', { method: 'PATCH', body: input })
}
