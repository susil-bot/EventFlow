/**
 * Demo data for `npm run seed`: accounts for every role and events that
 * cover each category, format, price and state (draft, full, canceled,
 * with time slots).
 */

export const users = [
  {
    name: 'Ada Admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    status: 'ACTIVE'
  },
  {
    name: 'Olivia Organizer',
    email: 'organizer@example.com',
    role: 'ORGANIZER'
  },
  {
    name: 'Priya Pending',
    email: 'pending-organizer@example.com',
    role: 'ORGANIZER',
    status: 'PENDING_APPROVAL'
  },
  {
    name: 'Oscar Organizer',
    email: 'organizer2@example.com',
    role: 'ORGANIZER'
  },
  { name: 'Asha Attendee', email: 'attendee@example.com', role: 'ATTENDEE' },
  { name: 'Arjun Attendee', email: 'attendee2@example.com', role: 'ATTENDEE' },
  { name: 'Ava Attendee', email: 'attendee3@example.com', role: 'ATTENDEE' }
] as const;

export type SeedSlot = {
  label: string;
  hour: number;
  hours: number;
  capacity: number;
  attendees: string[];
};

export type SeedEvent = {
  organizer: string;
  title: string;
  slug: string;
  eventType: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  category: string;
  onlineUrl?: string;
  socialLinks?: { platform: string; url: string }[];
  /** When set, capacity and start come from the slots. */
  slots?: SeedSlot[];
  description: string;
  daysFromNow: number;
  hour: number;
  timeZone: string;
  venue: string;
  /** Required unless the event is online. */
  city?: string;
  capacity: number;
  /** Ticket price in paise; free when left out. */
  priceMinor?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELED';
  attendees: string[];
  /** Goes live this many hours from now (scheduled publishing). */
  publishInHours?: number;
  /** Listing ends this many hours from now. */
  expiresInHours?: number;
};

export const events: SeedEvent[] = [
  {
    organizer: 'organizer@example.com',
    title: 'React Chennai Meetup',
    slug: 'react-chennai-meetup',
    eventType: 'HYBRID',
    category: 'MEETUP',
    onlineUrl: 'https://meet.example.com/react-chennai',
    socialLinks: [
      { platform: 'WEBSITE', url: 'https://example.com/react-chennai' },
      { platform: 'LINKEDIN', url: 'https://www.linkedin.com/company/example' }
    ],
    description:
      'Monthly meetup on React Server Components, performance and testing. Talks, lightning demos and networking.',
    daysFromNow: 7,
    hour: 18,
    timeZone: 'Asia/Kolkata',
    venue: 'Tidel Park, Chennai',
    city: 'chennai',
    capacity: 50,
    status: 'PUBLISHED',
    attendees: ['attendee2@example.com']
  },
  {
    organizer: 'organizer@example.com',
    title: 'Last Seat Workshop: PostgreSQL Internals',
    slug: 'postgresql-internals-workshop',
    eventType: 'ONLINE',
    category: 'WORKSHOP',
    onlineUrl: 'https://meet.example.com/pg-internals',
    description:
      'Hands-on workshop on MVCC, row locks and transactions. Only two seats — useful for demoing the full-event flow.',
    daysFromNow: 10,
    hour: 10,
    timeZone: 'Asia/Kolkata',
    venue: 'Online (Zoom)',
    capacity: 2,
    status: 'PUBLISHED',
    attendees: ['attendee2@example.com']
  },
  {
    organizer: 'organizer@example.com',
    title: 'Product Design Roundtable (draft)',
    slug: 'product-design-roundtable',
    eventType: 'IN_PERSON',
    category: 'NETWORKING',
    description: 'Draft event that should never appear in the public listing.',
    daysFromNow: 20,
    hour: 16,
    timeZone: 'Asia/Kolkata',
    venue: 'WeWork Guindy, Chennai',
    city: 'chennai',
    capacity: 25,
    status: 'DRAFT',
    attendees: []
  },
  {
    organizer: 'organizer2@example.com',
    title: 'Node.js Bengaluru Night',
    slug: 'nodejs-bengaluru-night',
    eventType: 'IN_PERSON',
    category: 'MEETUP',
    description:
      'Evening of talks on Node.js streams, observability and the new test runner.',
    daysFromNow: 14,
    hour: 19,
    timeZone: 'Asia/Kolkata',
    venue: 'Koramangala Social, Bengaluru',
    city: 'bengaluru',
    capacity: 120,
    priceMinor: 19900,
    status: 'PUBLISHED',
    attendees: ['attendee@example.com', 'attendee3@example.com']
  },
  {
    organizer: 'organizer2@example.com',
    title: 'Canceled: Cloud Cost Clinic',
    slug: 'cloud-cost-clinic',
    eventType: 'IN_PERSON',
    category: 'CONFERENCE',
    description: 'This event was canceled and must not accept registrations.',
    daysFromNow: 5,
    hour: 11,
    timeZone: 'Asia/Kolkata',
    venue: 'WeWork BKC, Mumbai',
    city: 'mumbai',
    capacity: 40,
    status: 'CANCELED',
    attendees: []
  },
  {
    organizer: 'organizer@example.com',
    title: 'Kubernetes Hands-on Lab',
    slug: 'kubernetes-hands-on-lab',
    eventType: 'IN_PERSON',
    category: 'WORKSHOP',
    description:
      'Bring a laptop and deploy your first cluster. Pick the morning or the afternoon batch — each has its own seats.',
    daysFromNow: 12,
    hour: 10,
    timeZone: 'Asia/Kolkata',
    venue: 'IIT Madras Research Park, Chennai',
    city: 'chennai',
    capacity: 0,
    priceMinor: 49900,
    status: 'PUBLISHED',
    attendees: [],
    slots: [
      {
        label: 'Morning batch',
        hour: 10,
        hours: 2,
        capacity: 3,
        attendees: ['attendee2@example.com']
      },
      {
        label: 'Afternoon batch',
        hour: 14,
        hours: 2,
        capacity: 3,
        attendees: []
      }
    ]
  }
];
