/**
 * Creates an admin account. Admins can't sign up through the app.
 *
 *   ADMIN_PASSWORD='…' npm run admin:create -- --email ops@example.com --name "Ops Admin"
 *
 * The password is read from the environment (never a CLI argument, which
 * would end up in shell history). Without one, a strong random password is
 * generated and printed once.
 */
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { isPgError, pool, PG_UNIQUE_VIOLATION } from '../db/pool';
import { hashPassword } from '../modules/auth/password';
import { insertUser } from '../modules/auth/repository';
import { passwordSchema } from '../modules/auth/schemas';

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().email('Pass a valid --email.'),
  name: z.string().trim().min(1, 'Pass a --name.').max(100),
  password: passwordSchema
});

const main = async () => {
  const { values } = parseArgs({
    options: { email: { type: 'string' }, name: { type: 'string' } }
  });
  const generated = process.env.ADMIN_PASSWORD
    ? undefined
    : randomBytes(18).toString('base64url');
  const parsed = inputSchema.safeParse({
    email: values.email ?? process.env.ADMIN_EMAIL,
    name: values.name ?? process.env.ADMIN_NAME ?? 'Admin',
    password: process.env.ADMIN_PASSWORD ?? generated
  });
  if (!parsed.success) {
    console.error(
      parsed.error.issues.map((issue) => `- ${issue.message}`).join('\n')
    );
    process.exitCode = 1;
    return;
  }

  const { email, name, password } = parsed.data;
  try {
    await insertUser(pool, {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
      status: 'ACTIVE'
    });
  } catch (error) {
    if (isPgError(error, PG_UNIQUE_VIOLATION)) {
      console.error(`An account with ${email} already exists.`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
  console.log(`Admin ${email} created.`);
  if (generated) {
    console.log(
      `Generated password (shown once, store it safely): ${generated}`
    );
  }
};

main()
  .catch((error: unknown) => {
    console.error('Creating the admin failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
