import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { surveys, users } from '../models'
import { eq } from 'drizzle-orm'

@singleton()
export class SurveyRepository {
  private declare drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getSurveys(userId: number) {
    const userWithDietician = await this.drizzle.query.users.findFirst({
      where: eq(users.id, userId),
      with: { dietician: { with: { surveys: true } } },
    })

    return userWithDietician?.dietician.surveys ?? []
  }

  public async getSurveyWithPatients(id: number) {
    return await this.drizzle.query.surveys.findFirst({
      where: eq(surveys.id, id),
      with: {
        patients: true,
      },
    })
  }
}
