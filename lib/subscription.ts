import { Plan } from '@prisma/client'

export type Feature =
  | 'facturatie'
  | 'bonnen_ocr'
  | 'belasting_inzicht'
  | 'export'
  | 'onbeperkt_klanten'
  | 'onbeperkt_projecten'
  | 'kilometers'
  | 'gps_tracking'
  | 'geavanceerde_inzichten'
  | 'api_toegang'

const FEATURE_GATES: Record<Feature, Plan[]> = {
  facturatie:             ['PRO', 'PREMIUM'],
  bonnen_ocr:             ['PRO', 'PREMIUM'],
  belasting_inzicht:      ['PRO', 'PREMIUM'],
  export:                 ['PRO', 'PREMIUM'],
  onbeperkt_klanten:      ['PRO', 'PREMIUM'],
  onbeperkt_projecten:    ['PRO', 'PREMIUM'],
  kilometers:             ['PRO', 'PREMIUM'],
  gps_tracking:           ['PREMIUM'],
  geavanceerde_inzichten: ['PREMIUM'],
  api_toegang:            ['PREMIUM'],
}

export function hasAccess(plan: Plan, feature: Feature): boolean {
  return FEATURE_GATES[feature].includes(plan)
}

export function getLimits(plan: Plan) {
  switch (plan) {
    case 'FREE':
      return { maxClients: 3, maxProjects: 2 }
    case 'PRO':
    case 'PREMIUM':
      return { maxClients: -1, maxProjects: -1 }
  }
}

export function canAddClient(plan: Plan, currentCount: number): boolean {
  const limits = getLimits(plan)
  return limits.maxClients === -1 || currentCount < limits.maxClients
}

export function canAddProject(plan: Plan, currentCount: number): boolean {
  const limits = getLimits(plan)
  return limits.maxProjects === -1 || currentCount < limits.maxProjects
}
