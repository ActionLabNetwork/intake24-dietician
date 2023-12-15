import type { AppDatabase } from '../database'

export class UserRepository {
  private declare drizzleClient

  public constructor(private db: AppDatabase) {
    this.drizzleClient = db.drizzleClient
  }

  // public async isUserDietician(userId: number) {
  //   const user = await this.drizzleClient.query.users
  //     .findFirst({
  //       where: eq(users.id, userId),
  //       with: {
  //         dietician: true,
  //       },
  //     })
  //     .execute()
  // }
}
