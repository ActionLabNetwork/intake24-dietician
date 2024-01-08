import { z } from 'zod'
import { MAX_FILE_SIZE } from '../constants'

export const avatarSchema = z.number().lt(MAX_FILE_SIZE, {
  message: `Max image size is ${MAX_FILE_SIZE / 100000}MB.`,
})
