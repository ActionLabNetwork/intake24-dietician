import { createContainer, asFunction, asValue } from 'awilix'

import User from '@intake24-dietician/db/models/auth/user.model'
import Token from '@intake24-dietician/db/models/auth/token.model'
import { createAuthService } from '../services/auth.service'
import { createArgonHashingService } from '../services/hashing.service'
import { createEmailService } from '../services/email.service'
import { createJwtTokenService } from '../services/token.service'
import { createUserService } from '../services/user.service'
import { createLogger } from '../middleware/logger'
import type {
  IAuthService,
  IEmailService,
  IHashingService,
  ITokenService,
} from '@intake24-dietician/common/types/auth'
import { IUserService } from '@intake24-dietician/common/types/api'

interface IContainer {
  authService: IAuthService
  hashingService: IHashingService
  tokenService: ITokenService
  emailService: IEmailService
  userService: IUserService
  user: typeof User
  token: typeof Token
  createLogger: typeof createLogger
}

const container = createContainer<IContainer>({ injectionMode: 'PROXY' })
container.register({
  authService: asFunction(createAuthService),
  hashingService: asFunction(createArgonHashingService),
  tokenService: asFunction(createJwtTokenService),
  emailService: asFunction(createEmailService),
  userService: asFunction(createUserService),
  user: asValue(User),
  token: asValue(Token),
  createLogger: asFunction(() => createLogger),
})

export { container }
