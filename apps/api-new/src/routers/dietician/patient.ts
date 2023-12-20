import { AuthService } from '@/services/auth.service'
import { PatientService } from '@/services/patient.service'
import { protectedDieticianProcedure, router } from '../../trpc'
import {
  PatientCreateDtoSchema,
  PatientWithUserDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import { RecallDtoSchema } from '@intake24-dietician/common/entities-new/recall.dto'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'

@singleton()
export class DieticianPatientRouter {
  private router = router({
    getPatient: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/patients/{id}',
          tags: ['patients'],
          summary: 'Get a patient',
        },
      })
      .input(
        z.object({
          id: z.number().int(),
        }),
      )
      .output(PatientWithUserDto)
      .query(async opts => {
        return await this.patientService.getPatientById(opts.input.id)
      }),
    getPatients: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/patients',
          tags: ['patients'],
          summary: 'Get patients',
        },
      })
      .input(z.object({ surveyId: z.number() }))
      .output(z.array(PatientWithUserDto))
      .query(async opts => {
        return await this.patientService.getPatients(
          opts.input.surveyId,
          opts.ctx.dieticianId,
        )
      }),
    createPatient: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/survey/{surveyId}/patients',
          tags: ['patients'],
          summary: 'Create patients',
        },
      })
      .input(
        z.object({
          surveyId: z.number(),
          email: z.string().email(),
          patient: PatientCreateDtoSchema,
        }),
      )
      .output(z.number())
      .mutation(async opts => {
        const { surveyId, email, patient } = opts.input
        return (
          await this.authService.createPatient(
            opts.ctx.dieticianId,
            surveyId,
            email,
            patient,
          )
        ).id
      }),
    updatePatient: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'PUT',
          path: '/patients/{id}',
          tags: ['patients'],
          summary: 'Update patients',
        },
      })
      .input(
        z.object({
          id: z.number().int(),
          patient: PatientCreateDtoSchema.partial(),
          email: z.string().email(),
        }),
      )
      .output(z.void())
      .query(async opts => {
        const { id, email, patient } = opts.input
        await this.authService.updatePatient(
          opts.ctx.dieticianId,
          id,
          email,
          patient,
        )
      }),
    getRecalls: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/patients/{patientId}/recalls',
          tags: ['patients'],
          summary: 'Get recalls of a patient',
        },
      })
      .input(
        z.object({
          patientId: z.number().int(),
        }),
      )
      .output(z.array(RecallDtoSchema))
      .query(async opts => {
        return await this.patientService.getRecallsOfPatient(
          opts.input.patientId,
          opts.ctx.dieticianId,
        )
      }),
    getRecall: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/recalls/{id}',
          tags: ['patients'],
          summary: 'Get recall by id',
        },
      })
      .input(
        z.object({
          id: z.number().int(),
        }),
      )
      .output(RecallDtoSchema)
      .query(async opts => {
        return await this.patientService.getRecallById(
          opts.input.id,
          opts.ctx.dieticianId,
        )
      }),
  })

  public constructor(
    @inject(PatientService) private patientService: PatientService,
    @inject(AuthService) private authService: AuthService,
  ) {}

  public getRouter(): typeof this.router {
    return this.router
  }
}
