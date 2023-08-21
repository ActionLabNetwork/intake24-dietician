import type { Express } from 'express';
import express from 'express';

export default async (): Promise<Express> => {
  // Init express
  const app = express();

  return app;
};
