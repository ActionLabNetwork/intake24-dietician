import type { IDieticianProfileRepository } from '@intake24-dietician/db/types/repositories'
import {
  type DieticianProfileDTO,
  createDieticianProfileDTO,
} from '@intake24-dietician/common/entities/dietician-profile.dto'
import DieticianProfile from '../models/auth/dietician-profile.model'

export const createDieticianProfileRepository =
  (): IDieticianProfileRepository => {
    const createOne = async (
      userId: number,
    ): Promise<DieticianProfileDTO | null> => {
      return createDieticianProfileDTO(
        await DieticianProfile.create({ userId }),
      )
    }

    return { createOne }
  }
