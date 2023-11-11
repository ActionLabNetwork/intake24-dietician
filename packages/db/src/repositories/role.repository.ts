import type { IRoleRepository } from '../types/repositories'
import { baseRepositories } from './singleton'

export const createRoleRepository = (): IRoleRepository => {
  const { baseRoleRepository } = {
    baseRoleRepository: baseRepositories.baseRoleRepository(),
  }

  return { ...baseRoleRepository }
}
