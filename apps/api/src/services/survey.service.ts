// import type { Result } from '@intake24-dietician/common/types/utils'
// import { getErrorMessage } from '@intake24-dietician/common/utils/error'
// import { Op } from '@intake24-dietician/db/connection'
// import { toInt } from 'radash'
// import { z } from 'zod'

import type { SurveyAttributes } from '@intake24-dietician/common/types/auth'
import Survey from '@intake24-dietician/db/models/api/survey.model'
import type { Result } from '@intake24-dietician/common/types/utils'

// import { createLogger } from '../middleware/logger'

export const createSurveyService = () => {
  // Get the recall by id
  const getSurveySecretByAlias = async (
    id: string,
  ): Promise<Result<SurveyAttributes | null | Error>> => {
    try {
      const secret = await Survey.findOne({
        where: { alias: id },
        attributes: ['intake24Secret', 'intake24SurveyId'],
      })
      console.log('getSurveySecretByAlias: ', secret)
      if (secret !== null) return { ok: true, value: secret } as const
      return { ok: true, value: null } as const
    } catch (error) {
      console.log(error)
      return {
        ok: false,
        error: new Error('Error retriving Survey data'),
      } as const
    }
  }

  const getSurveysByOwnerId = async (
    ownerId: number,
  ): Promise<Result<SurveyAttributes[] | null | Error>> => {
    try {
      const surveys = await Survey.findAll({
        where: { ownerId },
        attributes: [
          'id',
          'name',
          'alias',
          'intake24SurveyId',
          'recallSubmissionUrl',
        ],
      })
      console.log('getSurveysByOwnerId: ', surveys.length)
      if (surveys !== null) return { ok: true, value: surveys } as const
      return { ok: true, value: null } as const
    } catch (error) {
      console.log(error)
      return {
        ok: false,
        error: new Error('Error retriving Survey data'),
      } as const
    }
  }

  return {
    getSurveySecretByAlias,
    getSurveysByOwnerId,
  }
}
