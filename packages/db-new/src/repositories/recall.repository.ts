import type { IRecall } from '@intake24-dietician/common/types/recall'
import assert from 'assert'
import { eq } from 'drizzle-orm'
import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { recalls } from '../models'

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
    return await this.drizzle.query.recalls.findMany({
      where: eq(recalls.patientId, patientId),
    })
  }

  public async createRecall(patientId: number, recall: IRecall) {
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
