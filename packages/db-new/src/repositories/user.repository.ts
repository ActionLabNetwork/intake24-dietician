import { eq, and } from 'drizzle-orm'
import moment from 'moment'
import { AppDatabase } from '../database'
import { dieticians, patients, surveys, tokens, users } from '../models'
import type { DieticianCreateDto } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { PatientFieldCreateDto } from '@intake24-dietician/common/entities/patient-profile.dto'
import type { UserCreateDto } from '@intake24-dietician/common/entities/user.dto'
import { NotFoundError } from '@intake24-dietician/common/errors/not-found-error'
import { UnauthorizedError } from '@intake24-dietician/common/errors/unauthorized-error'
import assert from 'assert'
import { inject, injectable } from 'tsyringe'

@injectable()
export class UserRepository {
  private drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async listUsers(limit: number, offset: number) {
    return await this.drizzle.query.users
      .findMany({
        limit,
        offset,
      })
      .execute()
  }

  public async verifyUser(id: number) {
    return await this.drizzle
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, id))
      .execute()
  }

  public async deleteUser(userId: number) {
    return (
      (
        await this.drizzle
          .update(users)
          .set({ deletionDate: moment().toDate() })
          .where(eq(users.id, userId))
          .execute()
      ).length > 1
    )
  }

  public async restoreUser(userId: number) {
    return (
      (
        await this.drizzle
          .update(users)
          .set({ deletionDate: null })
          .where(eq(users.id, userId))
          .execute()
      ).length > 1
    )
  }

  public async getUserByEmail(email: string) {
    return await this.drizzle.query.users
      .findFirst({
        where: eq(users.email, email),
      })
      .execute()
  }

  public async checkEmailExists(email: string) {
    return !!(await this.getUserByEmail(email))
  }

  public async resetPassword(token: string, hashedPassword: string) {
    return await this.drizzle.transaction(async tx => {
      const tokenEntity = await tx.query.tokens
        .findFirst({
          where: eq(tokens.token, token),
        })
        .execute()

      if (!tokenEntity) {
        throw new NotFoundError('Token not found')
      }
      if (moment().isAfter(moment(tokenEntity.expiresAt))) {
        throw new UnauthorizedError('Token expired')
      }

      return (
        (
          await tx
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, tokenEntity.userId))
            .execute()
        ).length > 0
      )
    })
  }

  public async isPatientDieticians(args: {
    dieticianId: number
    patientId: number
  }) {
    const { dieticianId, patientId } = args
    const patient = await this.drizzle.query.patients.findFirst({
      with: {
        survey: {
          with: {
            dietician: true,
          },
        },
      },
      where: eq(patients.id, patientId),
    })
    return patient?.survey?.dietician?.id === dieticianId
  }

  public async isSurveyDieticians(args: {
    dieticianId: number
    surveyId: number
  }) {
    const { dieticianId, surveyId } = args
    const survey = await this.drizzle.query.surveys.findFirst({
      where: eq(surveys.id, surveyId),
      with: {
        dietician: true,
      },
    })
    return survey?.dietician?.id === dieticianId
  }

  public async getDieticianByEmail(email: string) {
    const user = await this.drizzle.query.users
      .findFirst({
        where: and(eq(users.email, email), eq(users.role, 'Dietician')),
        with: {
          dietician: true,
        },
      })
      .execute()
    return user?.dietician
  }

  public async getDieticianById(id: number) {
    const user = await this.drizzle.query.users
      .findFirst({
        where: and(eq(users.id, id), eq(users.role, 'Dietician')),
        with: {
          dietician: true,
        },
      })
      .execute()
    return user
  }

  public async createDieticianUser(email: string, hashedPassword: string) {
    return await this.drizzle.transaction(async tx => {
      const [user] = await tx
        .insert(users)
        .values({ email, password: hashedPassword, role: 'Dietician' })
        .returning()
        .execute()
      assert(user)

      await tx.insert(dieticians).values({ userId: user.id }).execute()
      return user
    })
  }

  public async updateDietician(
    dieticianId: number,
    email: string,
    details: Partial<DieticianCreateDto>,
  ) {
    const updateTimestamp = moment().toDate()
    await this.drizzle.transaction(async tx => {
      const dietician = await tx
        .update(dieticians)
        .set({ ...details, updatedAt: updateTimestamp })
        .where(eq(dieticians.id, dieticianId))
        .returning()
        .execute()
      await tx
        .update(users)
        .set({ email })
        .where(eq(users.id, dietician[0]!!.userId))
        .returning()
        .execute()
    })
  }

  public async uploadAvatar(userId: number, buffer: string) {
    return (
      (
        await this.drizzle
          .update(users)
          .set({ avatar: buffer })
          .where(eq(users.id, userId))
          .returning()
          .execute()
      ).length > 0
    )
  }

  public async getPatient(patientId: number) {
    return await this.drizzle.query.patients
      .findFirst({
        where: eq(patients.id, patientId),
        with: {
          user: true,
          survey: true,
        },
      })
      .execute()
  }

  public async getPatientByUserIdAndEmail(userId: number, email: string) {
    return await this.drizzle.query.users
      .findFirst({
        where: and(
          eq(users.id, userId),
          eq(users.email, email),
          eq(users.role, 'Patient'),
        ),
        with: {
          patient: true,
        },
      })
      .execute()
  }

  public async createPatient(
    surveyId: number,
    email: string,
    // patientDetails: PatientFieldCreateDto,
  ) {
    await this.drizzle.transaction(async tx => {
      const [user] = await tx
        .insert(users)
        .values({ email, role: 'Patient' })
        .returning({ id: users.id })
        .execute()
      assert(user)
      const [patient] = await tx
        .insert(patients)
        .values({ surveyId, userId: user.id })
      assert(patient)
      // TODO: insert patient preferences
    })
  }

  public async updatePatient(
    patientId: number,
    patientDetails: Partial<PatientFieldCreateDto>,
    patientUserDetails: Partial<UserCreateDto>,
  ) {
    const updateTimestamp = moment().toDate()
    await this.drizzle.transaction(async tx => {
      const [patient] = await tx
        .update(patients)
        .set({ ...patientDetails, updatedAt: updateTimestamp })
        .where(eq(patients.id, patientId))
        .returning({ userId: patients.userId })
        .execute()
      assert(patient)
      await tx
        .update(users)
        .set({ ...patientUserDetails, updatedAt: updateTimestamp })
        .where(eq(users.id, patient.userId))
        .execute()
      // TODO: update patient preferences
    })
  }
}
