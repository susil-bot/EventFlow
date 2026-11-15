import type { SeedEvent } from './seed-data';

/**
 * Twenty more published events spread over every city, category, format,
 * price band and date filter, so Discover has something to show for any
 * combination. Together with the other seed files, every category has at
 * least two upcoming published events.
 */

type ShowcaseInput = Pick<
  SeedEvent,
  'title' | 'slug' | 'category' | 'description' | 'daysFromNow' | 'hour'
> &
  Partial<SeedEvent>;

const showcase = (input: ShowcaseInput): SeedEvent => ({
  organizer: 'organizer2@example.com',
  eventType: 'IN_PERSON',
  timeZone: 'Asia/Kolkata',
  venue: 'Online',
  capacity: 100,
  status: 'PUBLISHED',
  attendees: [],
  ...input
});

export const showcaseEvents: SeedEvent[] = [
  showcase({
    title: 'Open Mic Comedy at the Courtyard',
    slug: 'open-mic-comedy-courtyard',
    category: 'COMEDY_SHOW',
    description:
      'New comics try their sharpest five minutes. Hindi and English.',
    // Late show today, so the "Today" filter has something to show.
    daysFromNow: 0,
    hour: 23,
    venue: 'The Courtyard, Indiranagar',
    city: 'bengaluru',
    capacity: 120,
    priceMinor: 19900
  }),
  showcase({
    title: 'Indie Rock Night: Three Bands',
    slug: 'indie-rock-night-three-bands',
    category: 'MUSIC_SHOW',
    description: 'Three independent bands from Mumbai and Pune, one stage.',
    daysFromNow: 1,
    hour: 20,
    venue: 'Hard Rock Cafe, Worli',
    city: 'mumbai',
    capacity: 350,
    priceMinor: 99900,
    attendees: ['attendee2@example.com']
  }),
  showcase({
    title: 'Sufi Qawwali Under the Stars',
    slug: 'sufi-qawwali-under-the-stars',
    category: 'MUSIC_SHOW',
    description: 'An open-air evening of qawwali in the old city.',
    daysFromNow: 12,
    hour: 19,
    venue: 'Sunder Nursery',
    city: 'delhi-ncr',
    capacity: 600,
    priceMinor: 149900
  }),
  showcase({
    title: 'Kathakali: Kalyanasougandhikam',
    slug: 'kathakali-kalyanasougandhikam',
    category: 'PERFORMANCE',
    description: 'A full-length Kathakali performance with a pre-show talk.',
    daysFromNow: 5,
    hour: 18,
    venue: 'Kerala Kathakali Centre, Fort Kochi',
    city: 'kochi',
    capacity: 90,
    priceMinor: 35000
  }),
  showcase({
    title: 'Little Coders: Scratch for Kids',
    slug: 'little-coders-scratch-for-kids',
    category: 'KIDS',
    description:
      'Ages 8–12 build their first game in Scratch. Laptops provided.',
    daysFromNow: 3,
    hour: 10,
    venue: 'Science City',
    city: 'ahmedabad',
    capacity: 40,
    priceMinor: 49900,
    attendees: ['attendee3@example.com']
  }),
  showcase({
    title: 'Pottery Wheel Basics',
    slug: 'pottery-wheel-basics',
    category: 'WORKSHOP',
    organizer: 'organizer@example.com',
    // Scheduled: published, but only goes live in two days.
    publishInHours: 48,
    description:
      'Centre, open and pull your first bowl. Clay and firing included.',
    daysFromNow: 4,
    hour: 11,
    venue: 'Kala Ghoda Studio',
    city: 'mumbai',
    capacity: 12,
    priceMinor: 180000
  }),
  showcase({
    title: 'DevOps Days India',
    slug: 'devops-days-india',
    category: 'CONFERENCE',
    description: 'Two tracks on platform engineering, SRE and delivery.',
    daysFromNow: 21,
    hour: 9,
    venue: 'HICC, Madhapur',
    city: 'hyderabad',
    capacity: 800,
    priceMinor: 350000
  }),
  showcase({
    title: 'Women in Product Summit',
    slug: 'women-in-product-summit',
    category: 'CONFERENCE',
    eventType: 'HYBRID',
    onlineUrl: 'https://meet.example.com/wip-summit',
    description: 'Talks and workshops from product leaders. Streamed live.',
    daysFromNow: 15,
    hour: 10,
    venue: 'Taj Coromandel',
    city: 'chennai',
    capacity: 300,
    priceMinor: 249900
  }),
  showcase({
    title: 'Python Pune Monthly',
    slug: 'python-pune-monthly',
    category: 'MEETUP',
    organizer: 'organizer@example.com',
    description: 'Talks on typing, packaging and data tooling. Snacks on us.',
    daysFromNow: 6,
    hour: 18,
    venue: 'Thoughtworks, Yerwada',
    city: 'pune',
    capacity: 80
  }),
  showcase({
    title: 'Contemporary Indian Art Show',
    slug: 'contemporary-indian-art-show',
    category: 'EXHIBITION',
    description: 'Forty works by artists under 35. Open all weekend.',
    daysFromNow: 9,
    hour: 11,
    venue: 'Le Corbusier Centre',
    city: 'chandigarh',
    capacity: 400
  }),
  showcase({
    title: 'Satyajit Ray Retrospective',
    slug: 'satyajit-ray-retrospective',
    category: 'SCREENING',
    description: 'Restored prints of Charulata and Nayak with a critic Q&A.',
    daysFromNow: 7,
    hour: 17,
    venue: 'Nandan, Rabindra Sadan',
    city: 'kolkata',
    capacity: 220,
    priceMinor: 15000
  }),
  showcase({
    title: 'Retro Bollywood Night',
    slug: 'retro-bollywood-night',
    category: 'PARTY',
    organizer: 'organizer@example.com',
    // Early listing that closes three days before the party.
    expiresInHours: 7 * 24,
    description: 'Seventies to nineties hits all night. Dress code: retro.',
    daysFromNow: 10,
    hour: 21,
    venue: 'Sky Bar, Banjara Hills',
    city: 'hyderabad',
    capacity: 250,
    priceMinor: 120000
  }),
  showcase({
    title: 'Founders & Funders Mixer',
    slug: 'founders-and-funders-mixer',
    category: 'NETWORKING',
    organizer: 'organizer@example.com',
    description: 'Speed-meetings between early-stage founders and angels.',
    daysFromNow: 8,
    hour: 18,
    venue: '91springboard, Koramangala',
    city: 'bengaluru',
    capacity: 60,
    attendees: ['attendee@example.com']
  }),
  showcase({
    title: 'Design Leaders Breakfast',
    slug: 'design-leaders-breakfast',
    category: 'NETWORKING',
    description: 'Small-table breakfast for design managers. Invite a peer.',
    daysFromNow: 14,
    hour: 8,
    venue: 'The Leela Ambience, Gurugram',
    city: 'delhi-ncr',
    capacity: 30,
    priceMinor: 99900
  }),
  showcase({
    title: 'Climate Tech Hackathon',
    slug: 'climate-tech-hackathon',
    category: 'HACKATHON',
    eventType: 'HYBRID',
    onlineUrl: 'https://meet.example.com/climate-hack',
    organizer: 'organizer@example.com',
    description:
      '36 hours to build for clean energy and water. Prizes worth ₹5 lakh.',
    daysFromNow: 20,
    hour: 9,
    venue: 'IIT Madras Research Park',
    city: 'chennai',
    capacity: 200
  }),
  showcase({
    title: 'FinTech Build Weekend',
    slug: 'fintech-build-weekend',
    category: 'HACKATHON',
    description: 'Teams of four build on open banking APIs over a weekend.',
    daysFromNow: 25,
    hour: 10,
    venue: 'GIFT City Club',
    city: 'ahmedabad',
    capacity: 120
  }),
  showcase({
    title: 'Intro to LLM Evaluations',
    slug: 'intro-to-llm-evaluations',
    category: 'WEBINAR',
    eventType: 'ONLINE',
    onlineUrl: 'https://meet.example.com/llm-evals',
    organizer: 'organizer@example.com',
    description: 'How to measure model quality before you ship. Live Q&A.',
    daysFromNow: 2,
    hour: 16,
    capacity: 500
  }),
  showcase({
    title: 'Personal Finance for Freelancers',
    slug: 'personal-finance-for-freelancers',
    category: 'WEBINAR',
    eventType: 'ONLINE',
    onlineUrl: 'https://meet.example.com/freelance-finance',
    description: 'Taxes, invoicing and saving on an irregular income.',
    daysFromNow: 11,
    hour: 19,
    capacity: 300,
    priceMinor: 29900
  }),
  showcase({
    title: 'Heritage Walk: Old Pune Wadas',
    slug: 'heritage-walk-old-pune-wadas',
    category: 'OTHER',
    description: 'A two-hour guided walk through the wadas of Shaniwar Peth.',
    daysFromNow: 5,
    hour: 7,
    venue: 'Shaniwar Wada main gate',
    city: 'pune',
    capacity: 25,
    priceMinor: 30000
  }),
  showcase({
    title: 'Sunrise Beach Clean-up',
    slug: 'sunrise-beach-clean-up',
    category: 'OTHER',
    description:
      'Volunteer clean-up with gloves and bags provided. Breakfast after.',
    daysFromNow: 3,
    hour: 6,
    venue: 'Elliot’s Beach, Besant Nagar',
    city: 'chennai',
    capacity: 150
  })
];
