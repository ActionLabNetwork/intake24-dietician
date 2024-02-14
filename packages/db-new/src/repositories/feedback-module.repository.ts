import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'

@singleton()
export class FeedbackModuleRepository {
  private drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getAllFeedbackModules() {
    return await this.drizzle.query.feedbackModules.findMany()
  }
}
