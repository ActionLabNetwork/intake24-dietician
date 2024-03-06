import { resolveLogger } from '../di/di.config'
import { PatientService } from '../services/patient.service'
import { RecallSchema } from '@intake24-dietician/common/entities-new/recall.schema'
import type { Express } from 'express'
import { container } from 'tsyringe'
import { z } from 'zod'

export function registerIntegrationEndpoints(app: Express) {
  const patientService = container.resolve(PatientService)
  const logger = resolveLogger()

  app.post('/recall/:alias', async (req, res) => {
    try {
      const { alias } = z
        .object({
          alias: z.string(),
        })
        .parse(req.params)
      const recall = RecallSchema.parse(req.body)
      const jwt = z
        .string()
        .regex(/Bearer /)
        .parse(req.headers.authorization)
        .split(' ')[1]!
      await patientService.createRecall(alias, jwt, recall)
      res.sendStatus(201)
    } catch (error) {
      logger.error({
        message: 'Failed to create recall',
        error,
        body: req.body,
        params: req.params,
        headers: req.headers,
        cookies: req.cookies,
      })
      res.sendStatus(500)
    }
  })
}
