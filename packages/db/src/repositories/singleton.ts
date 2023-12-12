import { baseRepositoryCreators } from './factory'

type RepositoryCreatorKeys = keyof typeof baseRepositoryCreators
type RepositoryCache = {
  [K in RepositoryCreatorKeys]: ReturnType<
    (typeof baseRepositoryCreators)[K]
  > | null
}

const repositoryCache: RepositoryCache = {
  baseUserRepository: null,
  baseDieticianProfileRepository: null,
  basePatientProfileRepository: null,
  baseRoleRepository: null,
  baseUserRoleRepository: null,
  baseTokenRepository: null,
  basePatientPreferencesRepository: null,
  baseRecallFrequencyRepository: null,
  baseSurveyRepository: null,
  baseSurveyPreferencesRepository: null,
}

const getBaseRepository = <K extends RepositoryCreatorKeys>(name: K) => {
  if (!repositoryCache[name]) {
    repositoryCache[name] = baseRepositoryCreators[name]() as RepositoryCache[K]
  }

  return repositoryCache[name]!
}

export const baseRepositories = {
  baseUserRepository: () => getBaseRepository('baseUserRepository'),
  baseDieticianProfileRepository: () =>
    getBaseRepository('baseDieticianProfileRepository'),
  basePatientProfileRepository: () =>
    getBaseRepository('basePatientProfileRepository'),
  baseRoleRepository: () => getBaseRepository('baseRoleRepository'),
  baseUserRoleRepository: () => getBaseRepository('baseUserRoleRepository'),
  baseTokenRepository: () => getBaseRepository('baseTokenRepository'),
  basePatientPreferencesRepository: () =>
    getBaseRepository('basePatientPreferencesRepository'),
  baseRecallFrequencyRepository: () =>
    getBaseRepository('baseRecallFrequencyRepository'),
  baseSurveyRepository: () => getBaseRepository('baseSurveyRepository'),
  baseSurveyPreferencesRepository: () =>
    getBaseRepository('baseSurveyPreferencesRepository'),
}
