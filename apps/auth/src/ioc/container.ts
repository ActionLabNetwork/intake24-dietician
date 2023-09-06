import { createContainer, asValue, asFunction, asClass } from 'awilix'

import User from '@intake24-dietician/db/models/auth/user.model'
import { createAuthService } from '../services/auth.service'
import { createArgonHashingService } from '../services/hashing.service'
import { IAuthService, IHashingService } from '../types/auth'
import { AuthController } from '../controllers/auth.controller'
import { Controller, IocContainer } from 'tsoa'

interface IContainer {
  authService: IAuthService
  hashingService: IHashingService
  user: typeof User
  authController: Controller
}

const container = createContainer<IContainer>()
container.register({
  authService: asFunction(createAuthService),
  hashingService: asFunction(createArgonHashingService),
  user: asValue(User),
  authController: asClass(AuthController).singleton(),
})

const iocContainer: IocContainer = {
  get: <T>(controller: { prototype: T }): T => {
    return container.resolve<T>(controller as never)
  },
}

export { container, iocContainer }
