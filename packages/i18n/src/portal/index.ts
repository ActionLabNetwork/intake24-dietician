import en from './en'
import id from './id'

const messages = { en, id }

export type MessageSchema = typeof messages.en

export default messages
