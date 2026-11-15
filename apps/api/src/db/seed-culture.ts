import type { SeedEvent } from './seed-data';

/**
 * Entertainment and culture events for the demo, so every Discover
 * category and a range of ticket prices have something to show.
 */
export const cultureEvents: SeedEvent[] = [
  {
    organizer: 'organizer2@example.com',
    title: 'Laugh Riot: Stand-up Night',
    slug: 'laugh-riot-standup-night',
    eventType: 'IN_PERSON',
    category: 'COMEDY_SHOW',
    description:
      'Five comics, ninety minutes of fresh material in Tamil and English. Ages 16+.',
    daysFromNow: 2,
    hour: 20,
    timeZone: 'Asia/Kolkata',
    venue: 'The Music Academy, Chennai',
    city: 'chennai',
    capacity: 300,
    priceMinor: 39900,
    status: 'PUBLISHED',
    attendees: ['attendee@example.com']
  },
  {
    organizer: 'organizer2@example.com',
    title: 'Carnatic Fusion Evening',
    slug: 'carnatic-fusion-evening',
    eventType: 'IN_PERSON',
    category: 'MUSIC_SHOW',
    description:
      'Veena, mridangam and electric guitar in an evening of Carnatic fusion.',
    daysFromNow: 4,
    hour: 19,
    timeZone: 'Asia/Kolkata',
    venue: 'Kalakshetra Auditorium, Chennai',
    city: 'chennai',
    capacity: 400,
    priceMinor: 79900,
    status: 'PUBLISHED',
    attendees: []
  },
  {
    organizer: 'organizer@example.com',
    title: 'Little Scientists: Kids Science Fair',
    slug: 'little-scientists-science-fair',
    eventType: 'IN_PERSON',
    category: 'KIDS',
    description:
      'Hands-on experiments for ages 6 to 12. Parents attend free with a child.',
    daysFromNow: 3,
    hour: 10,
    timeZone: 'Asia/Kolkata',
    venue: 'Birla Planetarium, Chennai',
    city: 'chennai',
    capacity: 80,
    status: 'PUBLISHED',
    attendees: []
  },
  {
    organizer: 'organizer@example.com',
    title: 'Coastal Photography Exhibition',
    slug: 'coastal-photography-exhibition',
    eventType: 'IN_PERSON',
    category: 'EXHIBITION',
    description:
      'Forty prints of the Coromandel coast by local photographers. Walk in any time.',
    daysFromNow: 6,
    hour: 11,
    timeZone: 'Asia/Kolkata',
    venue: 'Lalit Kala Akademi, Chennai',
    city: 'chennai',
    capacity: 500,
    status: 'PUBLISHED',
    attendees: []
  },
  {
    organizer: 'organizer2@example.com',
    title: 'Bharatanatyam Margam Recital',
    slug: 'bharatanatyam-margam-recital',
    eventType: 'IN_PERSON',
    category: 'PERFORMANCE',
    description: 'A full margam performed by senior students of the academy.',
    daysFromNow: 9,
    hour: 18,
    timeZone: 'Asia/Kolkata',
    venue: 'Narada Gana Sabha, Chennai',
    city: 'chennai',
    capacity: 250,
    priceMinor: 29900,
    status: 'PUBLISHED',
    attendees: []
  },
  {
    organizer: 'organizer2@example.com',
    title: 'Indie Shorts Screening',
    slug: 'indie-shorts-screening',
    eventType: 'IN_PERSON',
    category: 'SCREENING',
    description:
      'Six award-winning short films followed by a Q&A with the directors.',
    daysFromNow: 8,
    hour: 18,
    timeZone: 'Asia/Kolkata',
    venue: 'Bangalore International Centre, Bengaluru',
    city: 'bengaluru',
    capacity: 150,
    priceMinor: 25000,
    status: 'PUBLISHED',
    attendees: []
  },
  {
    organizer: 'organizer2@example.com',
    title: 'Rooftop New Year Party',
    slug: 'rooftop-new-year-party',
    eventType: 'IN_PERSON',
    category: 'PARTY',
    description: 'DJ sets, a countdown and a view of the city. Ages 21+.',
    daysFromNow: 18,
    hour: 21,
    timeZone: 'Asia/Kolkata',
    venue: 'Lower Parel Rooftop, Mumbai',
    city: 'mumbai',
    capacity: 200,
    priceMinor: 149900,
    status: 'PUBLISHED',
    attendees: []
  }
];
