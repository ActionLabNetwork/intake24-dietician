// src/server.ts
import { app } from './app';
import { env } from './config/env';
import { sequelize, connect } from '@intake24-dietician/db/connection';

const port = env.PORT || 3000;

connect()
  .then(() => {
    app.listen(port, () => console.log(`Auth listening at http://localhost:${port}`));

    console.log(sequelize.models);
  })
  .catch((error) => {
    console.error('❌ Unable to connect to database:', error);
  });
