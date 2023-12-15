import { singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { surveys } from '../models'
import { eq } from 'drizzle-orm'

@singleton()
export class SurveyRepository {
  private declare drizzle

  public constructor(private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getSurveyWithPatients(id: number) {
    return await this.drizzle.query.surveys
      .findFirst({
        where: eq(surveys.id, id),
        with: {
          patients: true,
        },
      })
      .execute()
  } 
}
