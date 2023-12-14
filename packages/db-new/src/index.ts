import { AppDataSource } from './data-source'

const connectTypeOrm = async () => {
  console.log('✅ Connected to TypeORM')
  return await AppDataSource.initialize().catch(error => {
    console.log(`Failed to connect to typeORM: ${error}`)
    throw error
  })
}

export { connectTypeOrm }
