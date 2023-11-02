// import type { Result } from '@intake24-dietician/common/types/utils'
// import { getErrorMessage } from '@intake24-dietician/common/utils/error'
// import { Op } from '@intake24-dietician/db/connection'
// import { toInt } from 'radash'
// import { z } from 'zod'

// import { createLogger } from '../middleware/logger'


export const createSurveyService = () => {
  // Get the recall by id
  const getSurveySecretByAlias = async (id: string): Promise<string | null> => {
    // return { ok: true, value: null } as const
    console.log('Trying to find the secret by Survey ID: ', id)
    // try {
      // const secret = await Survey.findOne({ id: id })
      // if (recall) return { ok: true, value: recall } as const
      // TODO: HARDCODED value
      return 'super_secret_jwt'
    // } 
    // catch (error) {
    //   return null
    // }
  }

  return {
    getSurveySecretByAlias,
  }
}
