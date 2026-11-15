import {
  isPgError,
  pool,
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION
} from '../../db/pool';
import { AppError, ErrorCode } from '../../errors/app-error';
import { hashPassword, verifyPassword } from './password';
import { findUserByEmail, insertUser, updateHomeCity } from './repository';
import type { LoginInput, SignupInput } from './schemas';
import type { AuthUser, UserRow } from './types';

const toAuthUser = (user: UserRow): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  homeCityId: user.home_city_id
});

// Compared against when the email is unknown so response time does not
// reveal whether an account exists.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => {
  dummyHash ??= hashPassword('timing-safe-placeholder');
  return dummyHash;
};

export const login = async ({
  email,
  password
}: LoginInput): Promise<AuthUser> => {
  const user = await findUserByEmail(pool, email);
  const isValid = await verifyPassword(
    password,
    user?.password_hash ?? (await getDummyHash())
  );

  if (!user || !isValid) {
    throw new AppError(
      401,
      ErrorCode.INVALID_CREDENTIALS,
      'Email or password is incorrect.'
    );
  }
  // Only revealed after a correct password, so it can't be used to probe
  // which accounts exist.
  if (user.status === 'SUSPENDED') {
    throw AppError.forbidden(
      'This account has been suspended. Please contact support for assistance.',
      ErrorCode.ACCOUNT_SUSPENDED
    );
  }
  return toAuthUser(user);
};

/** Organizers start pending until an admin approves them. */
export const signup = async (input: SignupInput): Promise<AuthUser> => {
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await insertUser(pool, {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: input.role === 'ORGANIZER' ? 'PENDING_APPROVAL' : 'ACTIVE'
    });
    return toAuthUser(user);
  } catch (error) {
    if (isPgError(error, PG_UNIQUE_VIOLATION)) {
      throw AppError.conflict(
        ErrorCode.EMAIL_TAKEN,
        'An account with this email already exists.',
        {
          fields: {
            email: 'An account with this email already exists. Sign in instead.'
          }
        }
      );
    }
    throw error;
  }
};

/** Saves the city Discover should open with (null clears it). */
export const setHomeCity = async (
  user: AuthUser,
  cityId: string | null
): Promise<AuthUser> => {
  try {
    await updateHomeCity(pool, user.id, cityId);
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) {
      throw AppError.badRequest('Please correct the highlighted fields.', {
        fields: { cityId: 'Choose a city from the list.' }
      });
    }
    throw error;
  }
  return { ...user, homeCityId: cityId };
};
