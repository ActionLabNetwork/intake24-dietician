import { createContainer, asValue, asFunction } from 'awilix'

import User from '@intake24-dietician/db/models/auth/user.model'
import { createAuthService } from '../services/auth.service'
import { createArgonHashingService } from '../services/hashing.service'
import { IAuthService, IHashingService, ITokenService } from '../types/auth'
import { Controller, IocContainer } from 'tsoa'
import { createJwtTokenService } from '../services/token.service'

interface IContainer {
  authController: Controller
  authService: IAuthService
  hashingService: IHashingService
  tokenService: ITokenService
  user: typeof User
}

const container = createContainer<IContainer>({ injectionMode: 'CLASSIC' })
container.register({
  // authController: asClass(AuthController).singleton().scoped(),
  authService: asFunction(createAuthService).scoped(),
  hashingService: asFunction(createArgonHashingService).scoped(),
  tokenService: asFunction(createJwtTokenService).scoped(),
  user: asValue(User),
})

const iocContainer: IocContainer = {
  get: <T>(controller: { prototype: T }): T => {
    return container.resolve<T>(controller as never)
  },
}

export { container, iocContainer }
