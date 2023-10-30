import { createContainer, asFunction, asValue } from 'awilix'

import User from '@intake24-dietician/db/models/auth/user.model'
import Token from '@intake24-dietician/db/models/auth/token.model'
import { createAuthService } from '../services/auth.service'
import { createArgonHashingService } from '../services/hashing.service'
import { createEmailService } from '../services/email.service'
import { createJwtTokenService } from '../services/token.service'
import { createLogger } from '../middleware/logger'
import type {
  IAuthService,
  IEmailService,
  IHashingService,
  ITokenService,
} from '@intake24-dietician/common/types/auth'

interface IContainer {
  authService: IAuthService
  hashingService: IHashingService
  tokenService: ITokenService
  emailService: IEmailService
  user: typeof User
  token: typeof Token
  createLogger: typeof createLogger
}

const container = createContainer<IContainer>({ injectionMode: 'PROXY' })
container.register({
  authService: asFunction(createAuthService).singleton(),
  hashingService: asFunction(createArgonHashingService).singleton(),
  tokenService: asFunction(createJwtTokenService).singleton(),
  emailService: asFunction(createEmailService).singleton(),
  user: asValue(User),
  token: asValue(Token),
  createLogger: asFunction(() => createLogger),
})

export { container }
