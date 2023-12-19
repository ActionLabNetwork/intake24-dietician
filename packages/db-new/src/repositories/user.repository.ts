import type { PatientPreference } from '@intake24-dietician/common/entities-new/preferences.dto'
import type {
  DieticianCreateDto,
  PatientCreateDto,
  UserCreateDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import assert from 'assert'
import { and, eq } from 'drizzle-orm'
import moment from 'moment'
import { inject, injectable } from 'tsyringe'
import { AppDatabase } from '../database'
import { dieticians, patients, surveys, users } from '../models'

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

  public async getUserById(id: number) {
    return await this.drizzle.query.users
      .findFirst({
        where: eq(users.id, id),
      })
      .execute()
  }

  public async getUserByEmail(email: string) {
    return await this.drizzle.query.users.findFirst({
      where: eq(users.email, email),
    })
  }

  public async checkEmailExists(email: string) {
    return !!(await this.getUserByEmail(email))
  }

  public async resetPassword(userId: number, hashedPassword: string) {
    await this.drizzle
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .execute()
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

  public async getDietician(id: number) {
    const user = await this.drizzle.query.dieticians
      .findFirst({
        where: eq(dieticians.id, id),
        with: {
          user: true,
        },
      })
      .execute()
    return user
  }

  public async getDieticianIdByUserId(userId: number) {
    const dietician = await this.drizzle.query.dieticians
      .findFirst({
        columns: {
          id: true,
        },
        where: eq(dieticians.userId, userId),
      })
      .execute()
    return dietician?.id
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
    return (
      (
        await this.drizzle.transaction(async tx => {
          const dietician = await tx
            .update(dieticians)
            .set({ ...details, updatedAt: updateTimestamp })
            .where(eq(dieticians.id, dieticianId))
            .returning()
            .execute()
          return await tx
            .update(users)
            .set({ email })
            .where(eq(users.id, dietician[0]!.userId))
            .returning()
            .execute()
        })
      ).length > 0
    )
  }

  public async uploadDieticianAvatar(dieticianId: number, buffer: string) {
    return (
      (
        await this.drizzle
          .update(dieticians)
          .set({ avatar: buffer })
          .where(eq(dieticians.id, dieticianId))
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
    patientDetails: PatientCreateDto & { patientPreference: PatientPreference },
  ) {
    return await this.drizzle.transaction(async tx => {
      const [user] = await tx
        .insert(users)
        .values({ email, role: 'Patient' })
        .returning({ id: users.id })
        .execute()
      assert(user)
      const [patient] = await tx
        .insert(patients)
        .values({ surveyId, userId: user.id, ...patientDetails })
        .returning()
        .execute()
      assert(patient)
      return patient
    })
  }

  public async updatePatient(
    patientId: number,
    patientDetails: Partial<PatientCreateDto>,
    patientUserDetails: Partial<UserCreateDto>,
  ) {
    const updateTimestamp = moment().toDate()
    return await this.drizzle.transaction(async tx => {
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
    })
  }
}
