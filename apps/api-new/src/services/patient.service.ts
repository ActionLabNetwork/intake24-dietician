import { ClientError, NotFoundError, UnauthorizedError } from '../utils/trpc'
import { RecallRepository } from '@intake24-dietician/db-new/repositories/recall.repository'
import { SurveyRepository } from '@intake24-dietician/db-new/repositories/survey.repository'
import { UserRepository } from '@intake24-dietician/db-new/repositories/user.repository'
import { assert } from 'console'
import { inject, singleton } from 'tsyringe'
import { JwtService } from './jwt.service'
import type { PatientWithUserDto } from '@intake24-dietician/common/entities-new/user.dto'
import moment from 'moment'
import type {
  RecallDatesDto,
  RecallDto,
} from '@intake24-dietician/common/entities-new/recall.dto'
import type { SurveyDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { recallReminderCooldown } from '@intake24-dietician/common/constants/settings-contants'
import { EmailService } from './email.service'

@singleton()
export class PatientService {
  public constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(RecallRepository) private recallRepository: RecallRepository,
    @inject(SurveyRepository) private surveyRepository: SurveyRepository,
    @inject(JwtService) private jwtService: JwtService,
    @inject(EmailService) private emailService: EmailService,
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

  public async getSampleRecall() {
    return await this.recallRepository.getSampleRecall()
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

  public async getRecallsOfPatientByRecallIds(
    patientId: number,
    dieticianId: number,
    recallIds: number[],
  ) {
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
    return await this.recallRepository.getRecallsOfPatientByRecallIds(
      patientId,
      recallIds,
    )
  }

  public async getRecallDatesOfPatient(patientId: number, dieticianId: number) {
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
    return await this.recallRepository.getRecallDatesOfPatient(patientId)
  }

  public async createRecall(
    alias: string,
    jwt: string,
    recall: RecallDto['recall'],
  ) {
    const survey = await this.surveyRepository.getSurveyByAlias(alias)
    if (!survey)
      throw new NotFoundError(`Survey of alias ${alias} is not found`)
    const secret = survey.intake24Secret
    await this.jwtService.validate(jwt, secret)
    if (recall.survey.slug !== survey.intake24SurveyId) {
      throw new ClientError('Wrong slug')
    }

    const patientUser = recall.user.aliases[0]
    assert(patientUser)
    if (!patientUser) throw new ClientError('Patient cannot be extracted')
    // we are using our user ID for Intake's username
    const patientIdMatch = /^dietician:(\d+)$/.exec(patientUser.username)
    const patientId = patientIdMatch?.[1]
      ? parseInt(patientIdMatch[1], 10)
      : null // patientId will be null if no match is found
    if (!patientId || isNaN(patientId)) {
      throw new ClientError('Failed to extract patient ID')
    }
    const patient = await this.userRepository.getPatient(patientId)
    if (!patient) throw new NotFoundError('Patient cannot be found')
    if (patient.surveyId !== survey.id)
      throw new ClientError('The client does not belong to the survey')

    await this.recallRepository.createRecall(patientId, recall)
  }

  public async sendRecallReminder(patientId: number, dieticianId: number) {
    const patient = await this.userRepository.getPatient(patientId)
    if (!patient) {
      throw new NotFoundError('Patient cannot be found')
    }
    if (patient?.survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError('Dietician has access to this patient')
    }

    const patientWithExtraFields = await this.attachExtraPatientFields(patient)
    if (
      patientWithExtraFields.lastReminderSent &&
      moment().isBefore(
        moment(patientWithExtraFields.lastReminderSent).add(
          recallReminderCooldown,
        ),
      )
    ) {
      throw new ClientError(
        `Last email was sent under ${recallReminderCooldown.humanize()} ago`,
      )
    }

    await this.emailService.sendReminderEmail(
      patientWithExtraFields.user.email,
      patientWithExtraFields.startSurveyUrl,
    )
    await this.userRepository.updatePatientLastReminderSent(
      patientId,
      moment().toDate(),
    )
  }

  private async attachExtraPatientFields(
    patient: Omit<PatientWithUserDto, 'startSurveyUrl'> & {
      survey: Pick<
        SurveyDto,
        'intake24Host' | 'intake24SurveyId' | 'intake24Secret'
      >
    },
  ): Promise<PatientWithUserDto & { recallDates: RecallDatesDto[] }> {
    const payload = {
      username: `dietician:${patient.id}`,
      password: 'super_secret_password', // TODO: should this be created for the user and stored?
      redirectUrl: 'https://google.com', // TODO: what should this be set to
    }
    const jwt = await this.jwtService.sign(
      payload,
      moment().add(5, 'days').toDate(),
      patient.survey.intake24Secret,
    )

    const recallDates = await this.recallRepository.getRecallDatesOfPatient(
      patient.id,
    )

    const survey = patient.survey
    const startSurveyUrl = new URL(survey.intake24Host)

    // currently when a dietician creates a survey, the UI displays the subdomain 'admin'
    // and the API saves it as-is. The assumption here is the survey creation endpoint always
    // only differs by the subdomain.
    const subdomains = startSurveyUrl.hostname.split('.')
    if (subdomains[0] === 'admin') {
      subdomains[0] = 'survey'
    }
    startSurveyUrl.hostname = subdomains.join('.')
    startSurveyUrl.pathname = `${survey.intake24SurveyId}/create-user/${jwt}`
    return {
      ...patient,
      startSurveyUrl: startSurveyUrl.toString(),
      recallDates,
    }
  }
}
