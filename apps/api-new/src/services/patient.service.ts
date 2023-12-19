import { NotFoundError, UnauthorizedError } from '@/utils/trpc'
import { UserRepository } from '@intake24-dietician/db-new/repositories/user.repository'
import { RecallRepository } from '@intake24-dietician/db-new/repositories/recall.repository'
import { inject, singleton } from 'tsyringe'

@singleton()
export class PatientService {
  public constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(RecallRepository) private recallRepository: RecallRepository,
  ) {}

  public async getPatientById(id: number) {
    const patient = await this.userRepository.getPatient(id)
    if (!patient) throw new NotFoundError('Patient not found')
    return patient
  }

  public async getPatients(surveyId: number, dieticianId: number) {
    return await this.userRepository.getPatientsBySurveyIdAndDieticianId(
      surveyId,
      dieticianId,
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
    if (!this.userRepository.isPatientDieticians({ patientId, dieticianId })) {
      throw new UnauthorizedError(
        'You are not authorized to access this recall',
      )
    }
    return await this.recallRepository.getRecallsOfPatient(patientId)
  }
}
