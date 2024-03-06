import en from './en'
import id from './id'

const messages = {
  en,
  // @ts-ignore TODO: incomplete translations
  id: id as typeof en,
}

export type MessageSchema = typeof messages.en

export default messages
