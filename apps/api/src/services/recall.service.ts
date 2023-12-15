import type { IRecallExtended } from '@intake24-dietician/common/types/recall'
import type { Result } from '@intake24-dietician/common/types/utils'
import { Recall } from '@intake24-dietician/db/models/api/int24-recall.recall-model'
import { singleton } from 'tsyringe'
import { createLogger } from '../middleware/logger'

const logger = createLogger('ApiLogger')

@singleton()
export class RecallService {
  /**
   * Retrieves a recall by its ID.
   * @param id - The ID of the recall to retrieve.
   * @returns A Promise that resolves to a Result object containing either the retrieved recall or null if it doesn't exist, or an error if the retrieval fails.
   */
  public getRecallById = async (
    id: string,
  ): Promise<Result<IRecallExtended>> => {
    try {
      const recall = await Recall.findOne({ id: id })
      console.log({ recall })
      if (recall)
        return {
          ok: true,
          value: recall as unknown as IRecallExtended,
        } as const
      return {
        ok: false,
        error: new Error('Cannot get the recall by ID: ' + id),
      }
    } catch (error) {
      return {
        ok: false,
        error: new Error('Cannot get the recall by ID: ' + id),
      }
    }
  }

  /**
   * Retrieves all recalls by the user ID.
   * @param userId - The ID of the user for which to retrieve the recalls.
   * @returns A Promise that resolves to a Result object containing either the retrieved recalls or null if they don't exist, or an error if the retrieval fails.
   */
  public getRecallsByUserId = async (
    userId: string,
  ): Promise<Result<IRecallExtended[]>> => {
    try {
      const recalls = await Recall.find()
        .where('username')
        .equals(userId)
        .sort({ startTime: 1 })

      const formattedRecalls = recalls.map(recall => {
        const meals = recall.meals.map(m => {
          return {
            name: m.name,
            hours: m.hours,
            minutes: m.minutes,
            foods: m.foods.length,
          }
        })
        return {
          id: recall.id,
          user: { ...recall.user },
          surveyId: recall.surveyId,
          userId: recall.userId,
          startTime: recall.startTime,
          endTime: recall.endTime,
          meals: meals,
        }
      })
      return {
        ok: true,
        value: formattedRecalls as unknown as IRecallExtended[],
      } as const
    } catch (error) {
      return {
        ok: false,
        error: new Error(`Cannot find the recall by user ID ${userId}`),
      } as const
    }
  }

  /**
   * Creates a new recall.
   * @param newRecall - The new recall to create.
   * @returns A Promise that resolves to a Result object containing either the ID of the created recall or null if it doesn't exist, or an error if the creation fails.
   */
  public createRecall = async (
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
}
