import * as jose from 'jose'
import type { Result } from '@intake24-dietician/common/types/utils'

export class JwtService {
  public constructor(private readonly secret: string) {}

  public async sign(
    payload: jose.JWTPayload,
    expirationTime: Date,
    secret?: string
  ): Promise<string> {
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(new TextEncoder().encode(secret ?? this.secret))
  }

  public async validate<T>(
    jwt: string,
    secret?: string,
  ): Promise<jose.JWTPayload> {
    const { payload, protectedHeader } = await jose.jwtVerify(
      jwt,
      new TextEncoder().encode(secret ?? this.secret),
    )
    return payload
  }

  public async safeValidate<T>(
    jwt: string,
    secret?: string,
  ): Promise<Result<jose.JWTPayload, 'expired' | 'invalid'>> {
    try {
      return { ok: true, value: await this.validate(jwt, secret) }
    } catch (e) {
      if (e instanceof jose.errors.JWTExpired) {
        return { ok: false, error: 'expired' } as const
      }
      if (e instanceof jose.errors.JWTInvalid) {
        return { ok: false, error: 'invalid' } as const
      }
      throw e
    }
  }
}
