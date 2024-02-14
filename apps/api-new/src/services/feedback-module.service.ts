import { FeedbackModuleRepository } from '@intake24-dietician/db-new/repositories/feedback-module.repository'
import { inject, singleton } from 'tsyringe'

@singleton()
export class FeedbackModuleService {
  public constructor(
    @inject(FeedbackModuleRepository)
    private feedbackModuleRepository: FeedbackModuleRepository,
  ) {}

  public async getAllFeedbackModules() {
    return await this.feedbackModuleRepository.getAllFeedbackModules()
  }
}
