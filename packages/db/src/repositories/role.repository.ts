import { singleton } from 'tsyringe'
import { baseRepositories } from './singleton'

@singleton()
export class RoleRepository {
  public baseRoleRepository = baseRepositories.baseRoleRepository()
}
