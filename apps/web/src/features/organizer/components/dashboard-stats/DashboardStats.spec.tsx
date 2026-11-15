import {
  canceledEvent,
  draftEvent,
  fullEvent,
  makeEvent
} from '@/shared/test/fixtures/events';
import { summarizeEvents } from './DashboardStats';

describe('summarizeEvents', () => {
  it('counts only live events toward registrations and availability', () => {
    expect(
      summarizeEvents([makeEvent(), fullEvent, draftEvent, canceledEvent])
    ).toEqual({ total: 4, live: 2, registered: 14, available: 38 });
  });
});
