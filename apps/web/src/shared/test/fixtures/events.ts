import type {
  AdminUser,
  AttendeeDto,
  AuditEntry,
  EventDto,
  EventSlot,
  RegistrationDto,
  User
} from '@/shared/api/types';

/** Shared fixtures for stories and tests. */
export const makeEvent = (overrides: Partial<EventDto> = {}): EventDto => ({
  id: 'evt-1',
  organizerId: 'org-1',
  organizerName: 'Olivia Organizer',
  title: 'React Chennai Meetup',
  description:
    'Monthly meetup on React Server Components, performance and testing.\n\nTalks, lightning demos and networking with the local community.',
  startsAt: '2030-09-03T12:30:00.000Z',
  startsAtLocal: '2030-09-03T18:00',
  timeZone: 'Asia/Kolkata',
  venue: 'Tidel Park, Chennai',
  city: { id: 'chennai', name: 'Chennai' },
  venueLocation: { latitude: 12.9894, longitude: 80.2486 },
  distanceKm: null,
  phase: 'LIVE',
  publishAt: null,
  publishAtLocal: null,
  expiresAt: null,
  expiresAtLocal: null,
  lastEditedBy: null,
  price: { amountMinor: 0, currency: 'INR' },
  capacity: 50,
  registeredCount: 12,
  availablePlaces: 38,
  status: 'PUBLISHED',
  eventType: 'IN_PERSON',
  category: 'MEETUP',
  slug: 'react-chennai-meetup',
  onlineUrl: null,
  socialLinks: [],
  images: [],
  slots: [],
  cancellationReason: null,
  hasStarted: false,
  isRegistrationOpen: true,
  createdAt: '2030-08-01T10:00:00.000Z',
  updatedAt: '2030-08-01T10:00:00.000Z',
  ...overrides
});

export const fullEvent = makeEvent({
  id: 'evt-full',
  title: 'Postgres Internals Workshop',
  venue: 'Online (Zoom)',
  capacity: 2,
  registeredCount: 2,
  availablePlaces: 0,
  isRegistrationOpen: false
});

export const canceledEvent = makeEvent({
  id: 'evt-canceled',
  title: 'Cloud Cost Clinic',
  status: 'CANCELED',
  phase: 'CANCELED',
  isRegistrationOpen: false
});

export const draftEvent = makeEvent({
  id: 'evt-draft',
  title: 'Product Design Roundtable',
  status: 'DRAFT',
  phase: 'DRAFT',
  registeredCount: 0,
  availablePlaces: 50,
  isRegistrationOpen: false
});

/** Published, goes live later (as the organizer sees it). */
export const scheduledEvent = makeEvent({
  id: 'evt-scheduled',
  title: 'Pottery Wheel Basics',
  phase: 'SCHEDULED',
  publishAt: '2030-09-01T04:30:00.000Z',
  publishAtLocal: '2030-09-01T10:00',
  expiresAt: '2030-09-03T06:30:00.000Z',
  expiresAtLocal: '2030-09-03T12:00',
  registeredCount: 0,
  availablePlaces: 50,
  isRegistrationOpen: false
});

export const attendeeUser: User = {
  id: 'att-1',
  name: 'Asha Attendee',
  email: 'attendee@example.com',
  role: 'ATTENDEE',
  status: 'ACTIVE',
  homeCityId: null
};

export const organizerUser: User = {
  id: 'org-1',
  name: 'Olivia Organizer',
  email: 'organizer@example.com',
  role: 'ORGANIZER',
  status: 'ACTIVE',
  homeCityId: null
};

export const pendingOrganizerUser: User = {
  id: 'org-pending',
  name: 'Priya Pending',
  email: 'pending-organizer@example.com',
  role: 'ORGANIZER',
  status: 'PENDING_APPROVAL',
  homeCityId: null
};

export const adminUser: User = {
  id: 'adm-1',
  name: 'Ada Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
  status: 'ACTIVE',
  homeCityId: null
};

export const makeAdminUser = (
  overrides: Partial<AdminUser> = {}
): AdminUser => ({
  id: 'usr-1',
  name: 'Oscar Organizer',
  email: 'organizer2@example.com',
  role: 'ORGANIZER',
  status: 'ACTIVE',
  statusChangedAt: null,
  createdAt: '2030-08-01T10:00:00.000Z',
  upcomingEventCount: 0,
  activeRegistrationCount: 0,
  ...overrides
});

export const auditEntries: AuditEntry[] = [
  {
    id: 'aud-2',
    adminId: 'adm-1',
    adminName: 'Ada Admin',
    action: 'SUSPEND_USER',
    targetType: 'USER',
    targetId: 'usr-9',
    reason: 'Spam sign-ups',
    metadata: {},
    createdAt: '2030-08-12T10:00:00.000Z'
  },
  {
    id: 'aud-1',
    adminId: 'adm-1',
    adminName: 'Ada Admin',
    action: 'APPROVE_ORGANIZER',
    targetType: 'USER',
    targetId: 'usr-1',
    reason: null,
    metadata: {},
    createdAt: '2030-08-11T09:00:00.000Z'
  }
];

export const makeRegistration = (
  overrides: Partial<RegistrationDto> = {}
): RegistrationDto => ({
  id: 'reg-1',
  status: 'ACTIVE',
  registeredAt: '2030-08-10T09:15:00.000Z',
  canceledAt: null,
  slot: null,
  event: makeEvent(),
  ...overrides
});

const makeSlot = (overrides: Partial<EventSlot> = {}): EventSlot => ({
  id: 'slot-1',
  label: 'Morning batch',
  startsAt: '2030-09-03T04:30:00.000Z',
  startsAtLocal: '2030-09-03T10:00',
  endsAt: '2030-09-03T06:30:00.000Z',
  endsAtLocal: '2030-09-03T12:00',
  capacity: 3,
  registeredCount: 1,
  availablePlaces: 2,
  hasStarted: false,
  ...overrides
});

export const slottedEvent = makeEvent({
  id: 'evt-slots',
  title: 'Kubernetes Hands-on Lab',
  slug: 'kubernetes-hands-on-lab',
  category: 'WORKSHOP',
  capacity: 6,
  registeredCount: 4,
  availablePlaces: 2,
  slots: [
    makeSlot({ registeredCount: 3, availablePlaces: 0 }),
    makeSlot({
      id: 'slot-2',
      label: 'Afternoon batch',
      startsAt: '2030-09-03T08:30:00.000Z',
      startsAtLocal: '2030-09-03T14:00',
      endsAt: '2030-09-03T10:30:00.000Z',
      endsAtLocal: '2030-09-03T16:00',
      registeredCount: 1,
      availablePlaces: 2
    })
  ]
});

export const onlineEvent = makeEvent({
  id: 'evt-online',
  title: 'Postgres Internals Webinar',
  slug: 'postgres-internals-webinar',
  eventType: 'ONLINE',
  venueLocation: null,
  category: 'WEBINAR',
  venue: 'Online',
  onlineUrl: 'https://meet.example.com/pg',
  socialLinks: [
    { platform: 'WEBSITE', url: 'https://example.com' },
    { platform: 'LINKEDIN', url: 'https://www.linkedin.com/company/example' }
  ]
});

export const attendees: AttendeeDto[] = [
  {
    registrationId: 'reg-1',
    attendeeId: 'att-1',
    name: 'Asha Attendee',
    email: 'attendee@example.com',
    registeredAt: '2030-08-10T09:15:00.000Z',
    slotLabel: null
  },
  {
    registrationId: 'reg-2',
    attendeeId: 'att-2',
    name: 'Arjun Attendee',
    email: 'attendee2@example.com',
    registeredAt: '2030-08-11T14:02:00.000Z',
    slotLabel: null
  }
];
