import { eq } from 'drizzle-orm'
import moment from 'moment'
import type { AppDatabase } from '../database'
import { dieticians, patients, surveys, tokens, users } from '../models'
import { DieticianCreateDto } from '@intake24-dietician/common/entities/dietician-profile.dto'
import { PatientFieldCreateDto } from '@intake24-dietician/common/entities/patient-profile.dto'
import { UserCreateDto } from '@intake24-dietician/common/entities/user.dto'
import assert from 'assert'
import { singleton } from 'tsyringe'

@singleton()
export class UserRepository {
  private declare drizzle

  public constructor(private db: AppDatabase) {
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

  public async resetPassword(token: string, hashedPassword: string) {
    await this.drizzle.transaction(async tx => {
      const tokenEntity = await tx.query.tokens
        .findFirst({
          where: eq(tokens, token),
        })
        .execute()

      if (!tokenEntity) {
        throw new Error('Token not found')
      }
      if (moment().isAfter(moment(tokenEntity.expiresAt))) {
        throw new Error('Token expired')
      }
      await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, tokenEntity.userId))
        .execute()
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
        where: eq(users.email, email),
        with: {
          dietician: true,
        },
      })
      .execute()
    return user?.dietician
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
    await this.drizzle
      .update(users)
      .set({ avatar: buffer })
      .where(eq(users.id, userId))
      .execute()
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

  public async createPatient(
    surveyId: number,
    email: string,
    patientDetails: PatientFieldCreateDto,
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
