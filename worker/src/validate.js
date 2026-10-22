/* worker/src/validate.js — contact form rules. Shared: the Worker enforces
   them (the only check that counts); the page imports them for instant feedback.
   Nothing secret lives here. */

// TODO(Nash): budget options in your words — or drop the picker entirely.
export const BUDGETS = ['just saying hi', 'under $500', '$500 – $2k', '$2k+'];

export const LIMITS = { name: 100, email: 200, message: 4000, messageMin: 10 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(input) {
  const errors = {};
  const s = v => (typeof v === 'string' ? v.trim() : '');
  const data = {
    name: s(input?.name),
    email: s(input?.email),
    budget: s(input?.budget),
    message: s(input?.message),
  };

  if (!data.name) errors.name = 'What should I call you?';
  else if (data.name.length > LIMITS.name) errors.name = 'That name is a bit long.';

  if (!data.email) errors.email = 'I need an email to write back.';
  else if (data.email.length > LIMITS.email || !EMAIL.test(data.email)) errors.email = 'That email doesn’t look right.';

  if (data.budget && !BUDGETS.includes(data.budget)) errors.budget = 'Pick one of the options.';

  if (data.message.length < LIMITS.messageMin) errors.message = 'Say a little more?';
  else if (data.message.length > LIMITS.message) errors.message = `Keep it under ${LIMITS.message} characters.`;

  // honeypot: humans never see this field
  if (s(input?.website)) errors.website = 'bot';

  return { ok: Object.keys(errors).length === 0, errors, data };
}
