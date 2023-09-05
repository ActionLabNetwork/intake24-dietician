/* eslint-disable max-nested-callbacks */
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import User from '@intake24-dietician/db/models/auth/user.model'
import { createAuthService } from '../src/services/auth.service'

jest.mock('argon2')
jest.mock('jsonwebtoken')
jest.mock('@intake24-dietician/db/models/auth/user.model')

describe('AuthService', () => {
  const email = 'test@example.com'
  const password = 'password123'
  const hashedPassword = 'hashedPassword123'
  const token = 'testToken'

  beforeEach(() => {
    ;(argon2.hash as jest.Mock).mockResolvedValue(hashedPassword)
    ;(jwt.sign as jest.Mock).mockReturnValue(token)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a user', async () => {
      ;(User.create as jest.Mock).mockResolvedValueOnce({
        get: jest.fn(() => ({ id: 1, email, password: hashedPassword })),
      })

      const { register } = createAuthService()
      const result = await register(email, password)

      expect(result).toMatchObject({
        id: 1,
        email,
        token,
      })
    })

    it('should throw an error if registration fails', async () => {
      const errorMsg = 'User already exists'
      ;(User.create as jest.Mock).mockRejectedValueOnce(new Error(errorMsg))

      const { register } = createAuthService()
      await expect(register(email, password)).rejects.toThrow(errorMsg)
    })
  })

  describe('login', () => {
    it('should successfully login an existing user', async () => {
      ;(argon2.verify as jest.Mock).mockResolvedValueOnce(true)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        password: hashedPassword,
        get: jest.fn(() => ({ id: 1, email })),
      })

      const { login } = createAuthService()
      const result = await login(email, password)

      expect(result).toMatchObject({
        id: 1,
        email,
        token,
      })
    })

    it('should return null for a non-existent user', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { login } = createAuthService()
      const result = await login(email, password)

      expect(result).toBeNull()
    })

    it('should return null for a wrong password', async () => {
      ;(argon2.verify as jest.Mock).mockResolvedValueOnce(false)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        password: hashedPassword,
        get: jest.fn(() => ({ id: 1, email })),
      })

      const { login } = createAuthService()
      const result = await login(email, password)

      expect(result).toBeNull()
    })
  })
})
