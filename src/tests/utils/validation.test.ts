import { describe, it, expect } from 'vitest';
import { passwordSchema, emailSchema, userSchema } from '../../utils/validation';

describe('Validation Schemas', () => {
  describe('passwordSchema', () => {
    it('validates correct passwords', () => {
      const validPassword = 'Test123!@';
      const result = passwordSchema.safeParse(validPassword);
      expect(result.success).toBe(true);
    });

    it('rejects invalid passwords', () => {
      const invalidPasswords = [
        'short', // too short
        'nouppercase123!', // no uppercase
        'NOLOWERCASE123!', // no lowercase
        'NoSpecialChar123', // no special char
        'NoNumber!@#', // no number
      ];

      invalidPasswords.forEach(password => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('emailSchema', () => {
    it('validates correct emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'missing@domain',
        'spaces in@email.com',
        '',
      ];

      invalidEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });
});