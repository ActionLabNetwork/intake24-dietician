import { Sequelize } from 'sequelize-typescript';
import { getDBUrl } from './config/env';

const sequelize = new Sequelize(getDBUrl('intake24-dietician-auth'));

sequelize.addModels([__dirname + '/**/*.model.ts']);

const connect = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
};

export { sequelize, connect };
