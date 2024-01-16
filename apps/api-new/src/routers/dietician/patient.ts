import {
  RecallDatesDtoSchema,
  RecallDtoSchema,
} from '@intake24-dietician/common/entities-new/recall.dto'
import {
  PatientUpdateDtoSchema,
  PatientWithUserDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { AuthService } from '../../services/auth.service'
import { PatientService } from '../../services/patient.service'
import { protectedDieticianProcedure, router } from '../../trpc'

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
      .output(
        z.array(
          PatientWithUserDto.extend({
            recallDates: z.array(RecallDatesDtoSchema),
          }),
        ),
      )
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
          patient: PatientUpdateDtoSchema,
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
          patient: PatientUpdateDtoSchema.partial(),
          email: z.string().email(),
        }),
      )
      .output(z.void())
      .mutation(async opts => {
        const { id, email, patient } = opts.input
        console.log({ patient })
        await this.authService.updatePatient(
          opts.ctx.dieticianId,
          id,
          email,
          patient,
        )
      }),
    sendRecallReminder: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/patients/{patientId}/reminder',
          tags: ['patients'],
          summary: 'Send a recall reminder to the patient',
        },
      })
      .input(
        z.object({
          patientId: z.number().int(),
        }),
      )
      .output(z.void())
      .mutation(async ({ input, ctx }) => {
        await this.patientService.sendRecallReminder(
          input.patientId,
          ctx.dieticianId,
        )
      }),
    getRecalls: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/patients/{patientId}/recalls',
          tags: ['patients', 'recalls'],
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
        const recalls = await this.patientService.getRecallsOfPatient(
          opts.input.patientId,
          opts.ctx.dieticianId,
        )

        return recalls
      }),
    getRecallDates: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/patients/{patientId}/recalls/dates',
          tags: ['patients', 'recalls'],
          summary: 'Get the recall dates of a patient',
        },
      })
      .input(
        z.object({
          patientId: z.number().int(),
        }),
      )
      .output(z.array(RecallDatesDtoSchema))
      .query(async opts => {
        const recalls = await this.patientService.getRecallDatesOfPatient(
          opts.input.patientId,
          opts.ctx.dieticianId,
        )

        return recalls
      }),
    getRecall: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/recalls/{id}',
          tags: ['patients', 'recalls'],
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
    getSampleRecall: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/recalls/sample',
          tags: ['patients', 'recalls'],
          summary:
            'Get sample recall to be displayed as preview for the feedback modules',
        },
      })
      .input(z.void())
      .output(RecallDtoSchema.nullish())
      .query(async () => {
        return await this.patientService.getSampleRecall()
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
