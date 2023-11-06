// import type { Result } from '@intake24-dietician/common/types/utils'
// import { getErrorMessage } from '@intake24-dietician/common/utils/error'
// import { Op } from '@intake24-dietician/db/connection'
// import { toInt } from 'radash'
// import { z } from 'zod'

import type { SurveyAttributes } from '@intake24-dietician/common/types/auth'
import Survey from "@intake24-dietician/db/models/auth/survey.model"
import type { Result } from '@intake24-dietician/common/types/utils'

// import { createLogger } from '../middleware/logger'


export const createSurveyService = () => {
  // Get the recall by id
  const getSurveySecretByAlias = async (id: string): Promise< Result <SurveyAttributes| null | Error >> => {
    // return { ok: true, value: null } as const
    console.log('Trying to find the secret by Survey ID: ', id)
    try {
      const secret = await Survey.findOne({ where : { intake24SurveyId: id }, attributes: ['intake24Secret'] })
      console.log('Found the secret: ', secret)
      if (secret !== null) return { ok: true, value: secret } as const
      return { ok: true, value: null } as const
    } 
    catch (error) {
      console.log(error);
      return { ok: true, value:  new Error('Error retriving Survey data') } as const
    }
  }

  return {
    getSurveySecretByAlias,
  }
}
