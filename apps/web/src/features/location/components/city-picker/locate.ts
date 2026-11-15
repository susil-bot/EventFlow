import type { Coordinates } from '../../utils/geo';

export type LocateErrorReason = 'unsupported' | 'denied' | 'unavailable';

export class LocateError extends Error {
  readonly reason: LocateErrorReason;

  constructor(reason: LocateErrorReason) {
    super(reason);
    this.name = 'LocateError';
    this.reason = reason;
  }
}

/**
 * Asks the browser for the visitor's position. Coarse accuracy is enough to
 * pick a city and is faster and less battery-hungry than GPS precision.
 */
export const locateWithBrowser = (): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new LocateError('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) =>
        reject(
          new LocateError(
            error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'
          )
        ),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 }
    );
  });
