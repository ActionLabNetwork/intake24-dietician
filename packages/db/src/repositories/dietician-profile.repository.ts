import { singleton } from 'tsyringe'
import { baseRepositories } from './singleton'


@singleton()
export class DieticianProfileRepository {
  private baseDieticianProfileRepository =
    baseRepositories.baseDieticianProfileRepository()
}
