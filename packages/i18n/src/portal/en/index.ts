import { LocaleMessages } from 'vue-i18n'
import { login } from './login'

type LoginSchema = typeof login

const messages: LocaleMessages<LoginSchema> = {
  login,
}

export default messages
