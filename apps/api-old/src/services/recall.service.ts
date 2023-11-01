import type { Result } from '@intake24-dietician/common/types/utils'
// import { getErrorMessage } from '@intake24-dietician/common/utils/error'
// import { Op } from '@intake24-dietician/db/connection'
import { Recall } from '@intake24-dietician/db/models/api/int24-recall.recall-model'
// import { toInt } from 'radash'
// import { z } from 'zod'

import { createLogger } from '../middleware/logger'
import type { IRecallExtended } from '@intake24-dietician/common/types/recall'

const logger = createLogger('ApiLogger')

export const createRecallService = () => {
  // Get the recall by id
  const getRecallById = async (
    id: string,
  ): Promise<Result<IRecallExtended | null>> => {
    logger.info('getRecallById', { id })
    // return { ok: true, value: null } as const
    console.log('Trying to find the recall by ID: ', id)
    try {
      const recall = await Recall.findOne({ id: id })
      if (recall) return { ok: true, value: recall as unknown as IRecallExtended } as const
        return { ok: true, value: null } as const
    } catch (error) {
      return {
        ok: false,
        error: new Error('Cannot create a recall entity: ', {}),
      }
    }
  }

  const createRecall = async (
    newRecall: IRecallExtended,
  ): Promise<Result<string | null>> => {
    logger.info('createRecall')
    // TODO: add validation
    // return { ok: true, value: null } as const
    console.log('Trying to save the recall', newRecall.id)
    try {
      const recall = new Recall(newRecall)
      const savedRecall = await recall.save()
      return { ok: true, value: savedRecall._id.toString() } as const
    } catch (error) {
      console.log(error)
      return {
        ok: false,
        error: new Error('Cannot create a recall entity: ', {}),
      }
    }
  }

  return {
    getRecallById,
    createRecall,
  }
}
