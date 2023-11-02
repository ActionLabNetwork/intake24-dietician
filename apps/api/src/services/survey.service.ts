import type { Result } from '@intake24-dietician/common/types/utils'
// import { getErrorMessage } from '@intake24-dietician/common/utils/error'
// import { Op } from '@intake24-dietician/db/connection'
// import { toInt } from 'radash'
// import { z } from 'zod'

import { createLogger } from '../middleware/logger'

const logger = createLogger('ApiLogger')

export const createSurveyService = () => {
  // Get the recall by id
  const getSurveySecretByAlias = async (
    id: string,
  ): Promise<Result<string | null>> => {
    logger.info('getSurveySecretByAlias', { id })
    // return { ok: true, value: null } as const
    console.log('Trying to find the secret by Survey ID: ', id)
    try {
      // const secret = await Survey.findOne({ id: id })
      // if (recall) return { ok: true, value: recall } as const
      return { ok: true, value: null } as const
    } catch (error) {
      return {
        ok: false,
        error: new Error('Cannot find a Survey with this ID: ', {}),
      }
    }
  }

  return {
    getSurveySecretByAlias,
  }
}
