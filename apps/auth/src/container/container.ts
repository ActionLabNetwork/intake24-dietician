import { createContainer, asValue, asFunction } from 'awilix'

import User from '@intake24-dietician/db/models/auth/user.model'
import { createAuthService } from '../services/auth.service'
import { createArgonHashingService } from '../services/hashing.service'

const container = createContainer()

container.register({
  authService: asFunction(createAuthService),
  hashingService: asFunction(createArgonHashingService),
  user: asValue(User),
})

export default container
