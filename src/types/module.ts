export interface Module {
  id: string
  name: string
  description: string
}

export interface ModulesResponse {
  code: string
  message: string
  modules: Module[]
}

export interface CreateModuleData {
  name: string
  description: string
  trainingId: string
} 


export interface ModuleInformationData {
  moduleId?: string
  keyConcepts: string
  primaryMaterials: string[]
  secondaryMaterials: string[]
  digitalTools: string[]
  instructionMethodIds: string[]
  differentiationStrategies: string
  technologyIntegrationId: string
  technologyIntegrationDescription: string
  inclusionStrategy: string
  teachingStrategy: string
  duration: number
  durationType: 'DAYS' | 'WEEKS' | 'MONTHS'
}