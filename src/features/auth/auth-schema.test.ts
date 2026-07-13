import { loginSchema } from '@/features/auth/auth-schema'

describe('loginSchema', () => {
  it('accepts a valid payload', () => {
    const result = loginSchema.safeParse({
      email: 'fabio@example.com',
      password: '12345678',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid email and short password', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '123',
    })

    expect(result.success).toBe(false)
  })
})
