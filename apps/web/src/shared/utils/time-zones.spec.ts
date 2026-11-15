import { getTimeZones } from './time-zones';

describe('getTimeZones', () => {
  it('lists UTC first and always includes common zones', () => {
    const zones = getTimeZones();

    expect(zones[0]).toBe('UTC');
    expect(zones).toContain('Asia/Kolkata');
    expect(new Set(zones).size).toBe(zones.length);
  });

  it("keeps an existing event's zone even if the browser does not list it", () => {
    expect(getTimeZones(['Etc/GMT+5'])).toContain('Etc/GMT+5');
  });
});
