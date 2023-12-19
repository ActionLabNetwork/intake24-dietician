import 'reflect-metadata'

import { AppDatabase } from '@intake24-dietician/db-new/database'
import {
  dieticians,
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

async function readJsonFile(filename: string) {
  const filePath = path.join(__dirname, filename)
  const data = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(data)
  return json
}

async function main() {
  const database = new AppDatabase(
    'postgres://postgres:postgres@localhost:5433/intake24-dietician-db',
  )
  container.register(AppDatabase, { useValue: database })
  const sql = database.sqlClient
  const drizzle = database.drizzleClient

  const tables =
    await sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`
  for (const table of tables) {
    const tableName = table['tablename']
    const statement = `TRUNCATE TABLE "${tableName}" CASCADE`
    await sql.unsafe(statement)
  }

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

  const recallTemplates = (await readJsonFile('recalls.json')) as IRecall[]
  console.log(recallTemplates)

  await drizzle.insert(recalls).values(
    recallTemplates.map(recall => ({
      recall,
      patientId: patient1!.id,
    })),
  )

  database.close()
}

main()
