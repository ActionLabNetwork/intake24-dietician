import type { Result } from '@intake24-dietician/common/types/utils'
// import { getErrorMessage } from '@intake24-dietician/common/utils/error'
// import { Op } from '@intake24-dietician/db/connection'
import type { Recall } from '@intake24-dietician/db/models/api/int24-recall.recall-model'
// import { toInt } from 'radash'
// import { z } from 'zod'

import { createLogger } from '../middleware/logger'

const logger = createLogger('ApiLogger')

export const createRecallService = () => {
  // Get the recall by id
  const getRecallById = async (
    id: string,
  ): Promise<Result<typeof Recall | null>> => {
    logger.info('getRecallById', { id })
    return { ok: true, value: null } as const
    // try {
    //     const recall = await Recall.findOne({
    //     where: { id },
    //     })
    //     return { ok: true, value: recall } as const
    // } catch (error) {
    //     return { ok: false, error: new Error(getErrorMessage(error)) } as const
    // }
  }

  return {
    getRecallById,
  }
}
