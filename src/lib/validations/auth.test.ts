import { loginSchema, registerSchema } from './auth';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret1' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret1' });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'secret1',
    confirmPassword: 'secret1',
  };

  it('accepts matching passwords', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('attaches an error to confirmPassword when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });
});
