import assert from 'assert'
import { and, eq, inArray } from 'drizzle-orm'
import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { recalls } from '../models'
import type { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'

@singleton()
export class RecallRepository {
  private declare drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getRecall(id: number) {
    return await this.drizzle.query.recalls.findFirst({
      where: eq(recalls.id, id),
    })
  }

  // TODO: Ensure there is a proper sample recall
  public async getSampleRecall() {
    return await this.drizzle.query.recalls.findFirst()
  }

  public async getRecallsOfPatient(patientId: number) {
    const _recalls = await this.drizzle.query.recalls
      .findMany({
        where: eq(recalls.patientId, patientId),
      })
      .execute()

    return _recalls
  }

  public async getRecallsOfPatientByRecallIds(
    patientId: number,
    recallIds: number[],
  ) {
    const _recalls = await this.drizzle.query.recalls
      .findMany({
        where: and(
          eq(recalls.patientId, patientId),
          inArray(recalls.id, recallIds),
        ),
      })
      .execute()

    return _recalls
  }

  public async getRecallDatesOfPatient(patientId: number) {
    const _recalls = await this.drizzle.query.recalls
      .findMany({
        where: eq(recalls.patientId, patientId),
      })
      .execute()

    const mappedRecalls = _recalls.map(recall => {
      const { recall: _recall } = recall

      return {
        ...recall,
        recall: {
          id: recall.id,
          i24Id: _recall.id,
          startTime: _recall.startTime,
          endTime: _recall.endTime,
        },
      }
    })

    return mappedRecalls
  }

  public async createRecall(patientId: number, recall: RecallDto['recall']) {
    const [insertedRecall] = await this.drizzle
      .insert(recalls)
      .values({
        patientId,
        recall,
      })
      .returning({ id: recalls.id })
      .execute()
    assert(insertedRecall)
    return insertedRecall.id
  }
}
