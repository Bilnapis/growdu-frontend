import { ValidationError } from 'yup'

export type FormFieldErrors<Field extends string> = Partial<
  Record<Field, string>
>

export function getYupValidationMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof ValidationError) {
    return error.errors[0] ?? fallbackMessage
  }

  return fallbackMessage
}

export function getYupFieldErrors<Field extends string>(
  error: unknown,
): FormFieldErrors<Field> {
  if (!(error instanceof ValidationError)) {
    return {}
  }

  return error.inner.reduce<FormFieldErrors<Field>>((errors, issue) => {
    if (issue.path && !errors[issue.path as Field]) {
      errors[issue.path as Field] = issue.message
    }

    return errors
  }, {})
}
