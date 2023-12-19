import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { eq } from 'drizzle-orm'
import { recalls } from '../models'
import assert from 'assert'
import type { IRecallExtended } from '@intake24-dietician/common/types/recall'

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

  public async createRecall(patientId: number, recall: IRecallExtended) {
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
