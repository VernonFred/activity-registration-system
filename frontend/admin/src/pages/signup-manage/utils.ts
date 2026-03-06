import type { Signup } from './config'

export function getAnswerValue(answer: any) {
  return answer?.value_text ?? (Array.isArray(answer?.value_json)
    ? answer.value_json.join(',')
    : answer?.value_json
      ? JSON.stringify(answer.value_json)
      : '')
}

export function getAnswerByLabels(signup: Signup, activity: any, labels: string[]): string | undefined {
  const found = (signup.answers || []).find((answer: any) => {
    const field = (activity?.form_fields || []).find((item: any) => item.id === answer.field_id)
    const label = field?.label || ''
    return labels.some((keyword) => label.includes(keyword))
  })
  if (!found) return undefined
  return getAnswerValue(found)
}
