import { createDefaultSignupFlow, type ActivityExtraConfig, type SignupFlowConfig, type SignupStepDefinition } from './types'

const BUILTIN_STEP_KEYS = ['personal', 'payment', 'accommodation', 'transport']

function makeStepId(key: string, index: number) {
  return `${key}-${index}`
}

function sanitizeStepDefinition(step: Partial<SignupStepDefinition>, fallback: SignupStepDefinition, index: number): SignupStepDefinition {
  return {
    id: typeof step.id === 'string' && step.id ? step.id : makeStepId(fallback.key, index),
    key: typeof step.key === 'string' && step.key.trim() ? step.key.trim() : fallback.key,
    title: typeof step.title === 'string' && step.title.trim() ? step.title.trim() : fallback.title,
    description: typeof step.description === 'string' ? step.description.trim() : fallback.description,
    enabled: typeof step.enabled === 'boolean' ? step.enabled : fallback.enabled,
    built_in: typeof step.built_in === 'boolean' ? step.built_in : fallback.built_in,
    order: typeof step.order === 'number' && Number.isFinite(step.order) ? step.order : index,
  }
}

function ensureBuiltinSteps(steps: SignupStepDefinition[]) {
  const defaults = createDefaultSignupFlow().steps
  const map = new Map(steps.map((step) => [step.key, step]))
  defaults.forEach((fallback, index) => {
    if (!map.has(fallback.key)) {
      map.set(fallback.key, { ...fallback, order: index })
      return
    }
    const current = map.get(fallback.key)!
    map.set(
      fallback.key,
      sanitizeStepDefinition(
        { ...current, key: fallback.key, built_in: true },
        fallback,
        current.order,
      ),
    )
  })

  return Array.from(map.values())
    .sort((left, right) => left.order - right.order)
    .map((step, index) => ({ ...step, order: index }))
}

export function normalizeSignupFlow(extra: Partial<ActivityExtraConfig>, defaults: SignupFlowConfig): SignupFlowConfig {
  const configured = extra.signup_flow as any
  const legacy = extra.signup_config

  if (configured && Array.isArray(configured.steps)) {
    return {
      steps: ensureBuiltinSteps(
        configured.steps.map((step: Partial<SignupStepDefinition>, index: number) =>
          sanitizeStepDefinition(step, defaults.steps[index] || defaults.steps[0], index),
        ),
      ),
    }
  }

  if (configured?.steps && typeof configured.steps === 'object') {
    const legacyOrder = Array.isArray(configured.step_order) && configured.step_order.length
      ? configured.step_order.filter((step: string) => BUILTIN_STEP_KEYS.includes(step))
      : BUILTIN_STEP_KEYS
    return {
      steps: ensureBuiltinSteps(
        legacyOrder.map((key: string, index: number) => {
          const fallback = defaults.steps.find((step) => step.key === key) || defaults.steps[index] || defaults.steps[0]
          const configuredStep = configured.steps[key] || {}
          const legacyEnabled =
            key === 'payment'
              ? legacy?.payment?.enabled
              : key === 'accommodation'
                ? legacy?.accommodation?.enabled
                : key === 'transport'
                  ? legacy?.transport?.enabled
                  : true
          return sanitizeStepDefinition(
            {
              ...fallback,
              enabled: typeof configuredStep.enabled === 'boolean' ? configuredStep.enabled : (legacyEnabled ?? fallback.enabled),
              order: index,
            },
            fallback,
            index,
          )
        }),
      ),
    }
  }

  const fallbackSteps = defaults.steps.map((step, index) => {
    const legacyEnabled =
      step.key === 'payment'
        ? legacy?.payment?.enabled
        : step.key === 'accommodation'
          ? legacy?.accommodation?.enabled
          : step.key === 'transport'
            ? legacy?.transport?.enabled
            : step.enabled
    return {
      ...step,
      enabled: typeof legacyEnabled === 'boolean' ? legacyEnabled : step.enabled,
      order: index,
    }
  })

  return { steps: ensureBuiltinSteps(fallbackSteps) }
}

export function sanitizeSignupFlow(flow: SignupFlowConfig): SignupFlowConfig {
  const seenKeys = new Set<string>()
  const sanitized = flow.steps
    .map((step, index) => ({
      ...step,
      id: step.id || makeStepId(step.key || `step-${index}`, index),
      key: (step.key || `step_${index}`).trim(),
      title: (step.title || `步骤 ${index + 1}`).trim(),
      description: step.description?.trim() || '',
      enabled: !!step.enabled,
      built_in: !!step.built_in,
      order: index,
    }))
    .filter((step) => {
      if (!step.key || seenKeys.has(step.key)) return false
      seenKeys.add(step.key)
      return true
    })

  return { steps: ensureBuiltinSteps(sanitized) }
}
