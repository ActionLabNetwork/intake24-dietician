import 'reflect-metadata'

import { AppDatabase } from '../../src/database'
import {
  dieticians,
  feedbackModuleToNutrientTypes,
  feedbackModules,
  patients,
  recalls,
  surveyToFeedbackModules,
  surveys,
  users,
} from '../../src/models'
import * as argon2 from 'argon2'
import fs from 'fs'
import path from 'path'
import { container } from 'tsyringe'
import type { IRecall } from '@intake24-dietician/common/types/recall'
import { nutrientTypes, nutrientUnits } from '../../src/models/nutrient.model'
import { eq } from 'drizzle-orm'
import { env } from '../../config/env'

async function readJsonFile(filename: string) {
  const filePath = path.join(__dirname, filename)
  const data = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(data)
  return json
}

function initDrizzle() {
  const database = new AppDatabase(env.PG_CONNECTION_STRING)
  const sql = database.sqlClient
  const drizzle = database.drizzleClient

  return { sql, drizzle }
}

async function cleanupTables(sql: ReturnType<typeof initDrizzle>['sql']) {
  const tables =
    await sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`
  for (const table of tables) {
    const tableName = table.tablename
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
      lastName: 'Smith',
      onboardingFinished: false,
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
      surveyName: 'Action Clinic',
      intake24Host: 'https://admin.intake24.dev',
      countryCode: 'au',
      intake24SurveyId: 'demo',
      intake24Secret: 'super_secret_secret',
      alias: 'demo_clinic',
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
      email: 'i24-d-p1@yopmail.com',
      password: await argon2.hash('password'),
      role: 'Dietician',
    })
    .returning()
    .execute()

  const [patient1] = await drizzle
    .insert(patients)
    .values({
      surveyId: survey!.id,
      firstName: 'Patient',
      middleName: '',
      lastName: '1',
      userId: patientUser!.id,
      mobileNumber: '',
      address: '',
      dateOfBirth: '01/01/2000',
      gender: 'Male',
      height: 180,
      weightHistory: [
        {
          timestamp: new Date('2023-01-01'),
          weight: 60,
        },
      ],
      additionalNotes: '',
      patientGoal: '',
      patientPreference: preference,
    })
    .returning({
      id: patients.id,
    })
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
      id: type.id,
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

async function seedSurveyToFeedbackModules(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
  survey: Awaited<ReturnType<typeof seedSurvey>>['survey'],
) {
  const ageLevels = (gender: string) => {
    return {
      '0-12': {
        ageRange: { min: 0, max: 12 },
        feedbackLevel: {
          below: `You are below the recommended intake as a ${gender}`,
          within: `You are within the recommended intake ${gender}`,
          above: `You are above the recommended intake ${gender}`,
          thresholds: {
            valuesBelow: 10,
            valuesAbove: 20,
          },
        },
      },
      '13-20': {
        ageRange: { min: 13, max: 20 },
        feedbackLevel: {
          below: `You are below the recommended intake as a ${gender}`,
          within: `You are within the recommended intake ${gender}`,
          above: `You are above the recommended intake ${gender}`,
          thresholds: {
            valuesBelow: 15,
            valuesAbove: 25,
          },
        },
      },
      '21-30': {
        ageRange: { min: 21, max: 30 },
        feedbackLevel: {
          below: `You are below the recommended intake as a ${gender}`,
          within: `You are within the recommended intake ${gender}`,
          above: `You are above the recommended intake ${gender}`,
          thresholds: {
            valuesBelow: 20,
            valuesAbove: 30,
          },
        },
      },
      '31-40': {
        ageRange: { min: 31, max: 40 },
        feedbackLevel: {
          below: `You are below the recommended intake as a ${gender}`,
          within: `You are within the recommended intake ${gender}`,
          above: `You are above the recommended intake ${gender}`,
          thresholds: {
            valuesBelow: 25,
            valuesAbove: 35,
          },
        },
      },
      '41-130': {
        ageRange: { min: 41, max: 130 },
        feedbackLevel: {
          below: `You are below the recommended intake as a ${gender}`,
          within: `You are within the recommended intake ${gender}`,
          above: `You are above the recommended intake ${gender}`,
          thresholds: {
            valuesBelow: 30,
            valuesAbove: 40,
          },
        },
      },
    }
  }

  const defaultFeedbackModules = await drizzle.query.feedbackModules.findMany()
  await drizzle.insert(surveyToFeedbackModules).values(
    defaultFeedbackModules.map(module => {
      const { id: _, ...moduleWithoutId } = module
      return {
        ...moduleWithoutId,
        surveyId: survey!.id,
        feedbackModuleId: module.id,
        levels: {
          rule: 'range' as const,
          criteria: {
            male: ageLevels('male'),
            female: ageLevels('female'),
            notSpecified: ageLevels('not specified'),
          },
        },
      }
    }),
  )
}

async function seedFeedbackModuleToNutrientTypes(
  drizzle: ReturnType<typeof initDrizzle>['drizzle'],
) {
  type EnhancedType = typeof feedbackModules.$inferSelect & {
    nutrientTypes: number[]
  }
  const feedbackModulesData = (await readJsonFile(
    'feedback-modules.json',
  )) as EnhancedType[]

  await drizzle.insert(feedbackModuleToNutrientTypes).values(
    feedbackModulesData.flatMap(module => {
      const moduleId = module.id

      return module.nutrientTypes.map(nutrientTypeId => {
        return { feedbackModuleId: moduleId, nutrientTypeId: nutrientTypeId }
      })
    }),
  )
}

async function main() {
  const database = new AppDatabase(env.PG_CONNECTION_STRING)
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
  await seedSurveyToFeedbackModules(drizzle, survey)
  await seedFeedbackModuleToNutrientTypes(drizzle)

  database.close()
  process.exit(0)
}

main()
