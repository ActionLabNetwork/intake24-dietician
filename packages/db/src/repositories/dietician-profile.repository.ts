import type { IDieticianProfileRepository } from '@intake24-dietician/db/types/repositories'
import { baseRepositories } from './singleton'

export const createDieticianProfileRepository =
  (): IDieticianProfileRepository => {
    const { baseDieticianProfileRepository } = {
      baseDieticianProfileRepository:
        baseRepositories.baseDieticianProfileRepository(),
    }

    return { ...baseDieticianProfileRepository }
  }
