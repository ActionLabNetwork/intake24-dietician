import {
  ClientError,
  NotFoundError,
  UnauthorizedError,
} from '@intake24-dietician/api-new/utils/trpc'
import type { IRecall } from '@intake24-dietician/common/types/recall'
import { RecallRepository } from '@intake24-dietician/db-new/repositories/recall.repository'
import { SurveyRepository } from '@intake24-dietician/db-new/repositories/survey.repository'
import { UserRepository } from '@intake24-dietician/db-new/repositories/user.repository'
import { assert } from 'console'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { JwtService } from './jwt.service'
import type { PatientWithUserDto } from '@intake24-dietician/common/entities-new/user.dto'
import moment from 'moment'

@singleton()
export class PatientService {
  public constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(RecallRepository) private recallRepository: RecallRepository,
    @inject(SurveyRepository) private surveyRepository: SurveyRepository,
    @inject(JwtService) private jwtService: JwtService,
  ) {}

  public async getPatientById(id: number) {
    const patient = await this.userRepository.getPatient(id)
    if (!patient) throw new NotFoundError('Patient not found')

    return await this.attachExtraPatientFields(patient)
  }

  public async getPatients(surveyId: number, dieticianId: number) {
    const patients =
      await this.userRepository.getPatientsBySurveyIdAndDieticianId(
        surveyId,
        dieticianId,
      )
    return await Promise.all(
      patients.map(patient => this.attachExtraPatientFields(patient)),
    )
  }

  public async getRecallById(id: number, dieticianId: number) {
    const recall = await this.recallRepository.getRecall(id)
    if (!recall) throw new NotFoundError('Recall not found')
    if (
      !this.userRepository.isPatientDieticians({
        patientId: recall.patientId,
        dieticianId,
      })
    ) {
      throw new UnauthorizedError(
        'You are not authorized to access this recall',
      )
    }
    return recall
  }

  public async getRecallsOfPatient(patientId: number, dieticianId: number) {
    if (
      !(await this.userRepository.isPatientDieticians({
        patientId,
        dieticianId,
      }))
    ) {
      throw new UnauthorizedError(
        'You are not authorized to access this recall',
      )
    }
    return await this.recallRepository.getRecallsOfPatient(patientId)
  }

  public async createRecall(surveyId: number, jwt: string, recall: IRecall) {
    const survey = await this.surveyRepository.getSurveyById(surveyId)
    if (!survey)
      throw new NotFoundError(`Survey of ID ${surveyId} is not found`)
    const secret = survey?.intake24Secret
    await this.jwtService.validate(jwt, secret !== '' ? undefined : secret)

    const patientUser = await recall.user.aliases[0]
    assert(patientUser)
    if (!patientUser) throw new ClientError('Patient cannot be extracted')
    // we are using our user ID for Intake's username
    const patientId = z.coerce.number().int().parse(patientUser.username)
    const patient = await this.userRepository.getPatient(patientId)
    if (!patient) throw new NotFoundError('Patient cannot be found')
    if (patient.surveyId !== surveyId)
      throw new ClientError('The client does not belong to the survey')

    await this.recallRepository.createRecall(patientId, recall)
  }

  private async attachExtraPatientFields(
    patient: Omit<PatientWithUserDto, 'startSurveyUrl'> & {
      survey: { intake24Secret: string; recallSubmissionURL: string }
    },
  ): Promise<PatientWithUserDto> {
    const payload = {
      username: patient.id.toString(),
      password: 'super_secret_password', // TODO: should this be created for the user and stored?
      redirectUrl: 'https://google.com', // TODO: what should this be set to
    }
    const jwt = await this.jwtService.sign(
      payload,
      moment().add(5, 'days').toDate(),
      patient.survey.intake24Secret && undefined,
    )
    return {
      ...patient,
      startSurveyUrl:
        patient.survey.recallSubmissionURL + `/create-user/${jwt}`,
    }
  }
}
