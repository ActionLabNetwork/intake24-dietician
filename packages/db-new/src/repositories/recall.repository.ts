import assert from 'assert'
import { eq } from 'drizzle-orm'
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

  public async getRecallsOfPatient(patientId: number) {
    const _recalls = await this.drizzle.query.recalls
      .findMany({
        where: eq(recalls.patientId, patientId),
      })
      .execute()

    return _recalls
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
