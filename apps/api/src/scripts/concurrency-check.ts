/**
 * Manual verification of the capacity guard against a running API.
 *
 *   npm run dev:api            # in one terminal
 *   npm run verify:concurrency # in another
 *   API_URL=http://localhost:8080/api npm run verify:concurrency  # Docker
 *
 * Creates a published online event with CAPACITY places, signs up ATTEMPTS
 * fresh attendees and fires all registrations at the same instant. Exactly
 * CAPACITY requests must succeed and the rest must fail with EVENT_FULL.
 *
 * Sign-in and sign-up share a per-IP rate limit (AUTH_RATE_LIMIT_MAX, 20 per
 * 15 minutes by default), so the default run uses 1 sign-in + 15 sign-ups.
 * For bigger runs, start the API with a higher AUTH_RATE_LIMIT_MAX.
 */
import { DateTime } from 'luxon';

const API = process.env.API_URL ?? 'http://localhost:4000/api';
const CAPACITY = Number(process.env.CAPACITY ?? 3);
const ATTEMPTS = Number(process.env.ATTEMPTS ?? 15);

const RATE_LIMITED_HINT =
  'Sign-ins and sign-ups are rate-limited per IP (AUTH_RATE_LIMIT_MAX, default 20 per 15 minutes). Wait, or restart the API with a higher AUTH_RATE_LIMIT_MAX.';

type ApiResult = {
  status: number;
  body: { data?: unknown; error?: { code: string } };
};

const call = async (
  path: string,
  init: RequestInit & { cookie?: string } = {}
): Promise<ApiResult & { cookie?: string }> => {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.cookie ? { cookie: init.cookie } : {})
    }
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : {},
    cookie: response.headers.get('set-cookie')?.split(';')[0]
  };
};

const main = async () => {
  const organizer = await call('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'organizer@example.com',
      password: 'Password123!'
    })
  });
  if (organizer.status === 429) {
    throw new Error(RATE_LIMITED_HINT);
  }
  if (organizer.status !== 200) {
    throw new Error('Run `npm run db:seed` first (organizer login failed).');
  }

  const startsAtLocal = DateTime.now()
    .plus({ days: 3 })
    .toFormat("yyyy-MM-dd'T'HH:mm");
  const created = await call('/events', {
    method: 'POST',
    cookie: organizer.cookie,
    body: JSON.stringify({
      title: `Concurrency check ${Date.now()}`,
      description: 'Created by scripts/concurrency-check.ts',
      startsAtLocal,
      timeZone: 'UTC',
      // Online: no city or map pin needed, so the check stays about capacity.
      eventType: 'ONLINE',
      onlineUrl: 'https://meet.example.com/concurrency-check',
      category: 'OTHER',
      capacity: CAPACITY,
      publish: true
    })
  });
  if (created.status !== 201) {
    throw new Error(
      `Could not create the test event (${created.status}): ${JSON.stringify(created.body)}`
    );
  }
  const eventId = (created.body.data as { id: string }).id;

  const runId = Date.now();
  const sessions = await Promise.all(
    Array.from({ length: ATTEMPTS }, (_, index) =>
      call('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: `Load Attendee ${index}`,
          email: `load-${runId}-${index}@example.com`,
          password: 'Password123!',
          role: 'ATTENDEE'
        })
      })
    )
  );

  if (sessions.some((session) => session.status === 429)) {
    throw new Error(RATE_LIMITED_HINT);
  }

  console.log(
    `Firing ${ATTEMPTS} simultaneous registrations for ${CAPACITY} places…`
  );
  const results = await Promise.all(
    sessions.map((session) =>
      call(`/events/${eventId}/registrations`, {
        method: 'POST',
        cookie: session.cookie
      })
    )
  );

  const tally = results.reduce<Record<string, number>>((acc, result) => {
    const key =
      result.status === 201
        ? 'REGISTERED'
        : (result.body.error?.code ?? 'UNKNOWN');
    return { ...acc, [key]: (acc[key] ?? 0) + 1 };
  }, {});
  const event = await call(`/events/${eventId}`);
  const { registeredCount, capacity } = event.body.data as {
    registeredCount: number;
    capacity: number;
  };

  console.table(tally);
  console.log(`Event registeredCount=${registeredCount} capacity=${capacity}`);

  const ok = tally.REGISTERED === CAPACITY && registeredCount === CAPACITY;
  console.log(ok ? 'PASS: capacity was never exceeded.' : 'FAIL');
  process.exitCode = ok ? 0 : 1;
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
