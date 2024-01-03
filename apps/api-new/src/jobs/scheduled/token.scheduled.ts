import { TokenService } from '@intake24-dietician/api-new/services/token.service'
import { inject, singleton } from 'tsyringe'

@singleton()
export class ScheduledJobToken {
  public constructor(
    @inject(TokenService) private tokenService: TokenService,
  ) {}

  public async deleteExpiredTokens() {
    this.tokenService.deleteExpiredTokens()
  }
}
