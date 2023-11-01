db = db.getSiblingDB('admin')
db.auth({
  user: process.env.MONGO_INITDB_ROOT_USERNAME,
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
})
db = db.getSiblingDB(process.env.MONGO_RECAL_DB_NAME)
db.createUser({
  user: process.env.MONGO_RECAL_DB_USERNAME,
  pwd: process.env.MONGO_RECAL_DB_PASSWORD,
  roles: [{ role: 'readWrite', db: process.env.MONGO_RECAL_DB_NAME }],
})

db.createCollection('int24_test_recalls')