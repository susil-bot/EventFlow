import { searchPlaces } from './geocoding';

const respond = (body: unknown, status = 200) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.restoreAllMocks());

describe('searchPlaces', () => {
  it('asks Nominatim for Indian matches and maps the results', async () => {
    const fetchSpy = respond([
      {
        place_id: 42,
        lat: '12.9894',
        lon: '80.2486',
        display_name: 'Tidel Park, Taramani, Chennai'
      },
      { place_id: 43, lat: 'oops', lon: '1', display_name: 'Broken' }
    ]);

    const results = await searchPlaces('Tidel Park');

    expect(results).toEqual([
      {
        id: '42',
        label: 'Tidel Park, Taramani, Chennai',
        location: { latitude: 12.9894, longitude: 80.2486 }
      }
    ]);
    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(url.origin + url.pathname).toBe(
      'https://nominatim.openstreetmap.org/search'
    );
    expect(url.searchParams.get('q')).toBe('Tidel Park');
    expect(url.searchParams.get('countrycodes')).toBe('in');
  });

  it('throws when the service answers with an error', async () => {
    respond({}, 503);
    await expect(searchPlaces('Anywhere')).rejects.toThrow(
      'Address search is unavailable right now (503). Please try again, or place the pin on the map.'
    );
  });
});
