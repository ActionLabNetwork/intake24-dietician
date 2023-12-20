import 'reflect-metadata'

import { AppDatabase } from '@intake24-dietician/db-new/database'
import {
  dieticians,
  feedbackModules,
  patients,
  recalls,
  surveys,
  users,
} from '@intake24-dietician/db-new/models'
import * as argon2 from 'argon2'
import fs from 'fs'
import path from 'path'
import { container } from 'tsyringe'
import type { IRecall } from '@intake24-dietician/common/types/recall'
import {
  nutrientTypes,
  nutrientUnits,
} from '@intake24-dietician/db-new/models/nutrient.model'
import { eq } from 'drizzle-orm'

async function readJsonFile(filename: string) {
  const filePath = path.join(__dirname, filename)
  const data = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(data)
  return json
}

function initDrizzle() {
  const database = new AppDatabase(
    'postgres://postgres:postgres@localhost:5433/intake24-dietician-db',
  )
  const sql = database.sqlClient
  const drizzle = database.drizzleClient

  return { sql, drizzle }
}

async function cleanupTables(sql: ReturnType<typeof initDrizzle>['sql']) {
  const tables =
    await sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`
  for (const table of tables) {
    const tableName = table['tablename']
    const statement = `TRUNCATE TABLE "${tableName}" CASCADE`
    const resetSequenceStatement = `
      SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), 1, false);
    `

    await sql.unsafe(statement)
    await sql.unsafe(resetSequenceStatement).catch(() => {}) // Let it fail silently if sequence doesn't exist
  }
}

async function seedUsers(drizzle: ReturnType<typeof initDrizzle>['drizzle']) {
  const preference = {
    theme: 'Classic',
    sendAutomatedFeedback: true,
    reminderCondition: {
      reminderEnds: {
        type: 'never',
      },
      reminderEvery: {
        every: 3,
        unit: 'days',
      },
    },
    reminderMessage: '',
    notifyEmail: true,
    notifySMS: true,
  } as const

  const [user] = await drizzle
    .insert(users)
    .values({
      email: 'diet@test.com',
      password: await argon2.hash('password'),
      role: 'Dietician',
    })
    .returning()
    .execute()
  const [dietician] = await drizzle
    .insert(dieticians)
    .values({
      userId: user!.id,
      firstName: 'John',
      middleName: '',
      lastName: 'Smith',
      mobileNumber: '',
      businessNumber: '',
      businessAddress: '',
      shortBio: '',
    })
    .returning()
    .execute()

  return { preference, dietician }
}

async function seedSurvey(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
  dietician: Awaited<ReturnType<typeof seedUsers>>['dietician'],
  preference: Awaited<ReturnType<typeof seedUsers>>['preference'],
) {
  const [survey] = await drizzle
    .insert(surveys)
    .values({
      dieticianId: dietician!.id,
      surveyName: 'Test survey',
      intake24SurveyId: 'test',
      intake24Secret: 'intake24_survey_secret',
      alias: 'test',
      recallSubmissionURL: 'https://intake24.co.uk/recall',
      surveyPreference: preference,
    })
    .returning()
    .execute()

  return { survey }
}

async function seedPatients(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
  survey: Awaited<ReturnType<typeof seedSurvey>>['survey'],
  preference: Awaited<ReturnType<typeof seedUsers>>['preference'],
) {
  const [patientUser] = await drizzle
    .insert(users)
    .values({
      email: 'p1@test.com',
      password: await argon2.hash('password'),
      role: 'Dietician',
    })
    .returning()
    .execute()

  const [patient1] = await drizzle
    .insert(patients)
    .values({
      surveyId: survey!.id,
      firstName: `Patient`,
      middleName: ``,
      lastName: `1`,
      userId: patientUser!.id,
      mobileNumber: '',
      address: '',
      age: 18,
      gender: 'Male',
      height: 180,
      weight: 60,
      additionalNotes: '',
      patientGoal: '',
      patientPreference: preference,
    })
    .returning()
    .execute()

  return { patient1 }
}

async function seedRecallTemplates(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
  patient1: Awaited<ReturnType<typeof seedPatients>>['patient1'],
) {
  const recallTemplates = (await readJsonFile('recalls.json')) as IRecall[]
  await drizzle.insert(recalls).values(
    recallTemplates.map(recall => ({
      recall,
      patientId: patient1!.id,
    })),
  )
}

async function seedNutrientUnits(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
) {
  const nutrientUnitsData = (await readJsonFile(
    'nutrient-units.json',
  )) as (typeof nutrientUnits.$inferSelect)[]

  await drizzle
    .insert(nutrientUnits)
    .values(nutrientUnitsData.map(nutrientUnit => ({ ...nutrientUnit })))
}
async function seedNutrientTypes(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
) {
  const nutrientTypesData = (await readJsonFile('nutrient-types.json')) as {
    id: number
    description: string
    unit_id: string
  }[]

  const typesPromises = nutrientTypesData.map(async type => {
    const unitId = await drizzle
      .select({ id: nutrientUnits.id })
      .from(nutrientUnits)
      .where(eq(nutrientUnits.description, type.unit_id))

    return drizzle.insert(nutrientTypes).values({
      unitId: unitId[0]!.id,
      description: type.description,
    })
  })

  await Promise.all(typesPromises)
}

async function seedFeedbackModules(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
) {
  const feedbackModulesData = (await readJsonFile(
    'feedback-modules.json',
  )) as (typeof feedbackModules.$inferSelect)[]

  await drizzle
    .insert(feedbackModules)
    .values(feedbackModulesData.map(module => ({ ...module })))
}

async function main() {
  const database = new AppDatabase(
    'postgres://postgres:postgres@localhost:5433/intake24-dietician-db',
  )
  container.register(AppDatabase, { useValue: database })
  const { sql, drizzle } = initDrizzle()

  await cleanupTables(sql)
  const { preference, dietician } = await seedUsers(drizzle)
  const { survey } = await seedSurvey(drizzle, dietician, preference)
  const { patient1 } = await seedPatients(drizzle, survey, preference)
  await seedRecallTemplates(drizzle, patient1)
  await seedNutrientUnits(drizzle)
  await seedNutrientTypes(drizzle)
  await seedFeedbackModules(drizzle)

  database.close()
  process.exit(0)
}

main()
