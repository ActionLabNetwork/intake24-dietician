import { createContainer, asValue, asFunction } from 'awilix'

import User from '@intake24-dietician/db/models/auth/user.model'
import { createAuthService } from '../services/auth.service'
import { createArgonHashingService } from '../services/hashing.service'
import { createEmailService } from '../services/email.service'
import {
  IAuthService,
  IEmailService,
  IHashingService,
  ITokenService,
} from '@intake24-dietician/common/types/auth'
import { Controller, IocContainer } from 'tsoa'
import { createJwtTokenService } from '../services/token.service'

interface IContainer {
  authController: Controller
  authService: IAuthService
  hashingService: IHashingService
  tokenService: ITokenService
  emailService: IEmailService
  user: typeof User
}

const container = createContainer<IContainer>({ injectionMode: 'PROXY' })
container.register({
  authService: asFunction(createAuthService),
  hashingService: asFunction(createArgonHashingService),
  tokenService: asFunction(createJwtTokenService),
  emailService: asFunction(createEmailService),
  user: asValue(User),
  // authController: asClass(AuthController),
})

const iocContainer: IocContainer = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get: <T>(controller: { prototype: T }): T => {
    return container.resolve<T>(controller as never)
  },
}

export { container, iocContainer }
