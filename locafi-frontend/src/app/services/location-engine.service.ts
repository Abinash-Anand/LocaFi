import { Injectable } from '@angular/core';

export interface GeoCoords {
  lat: number;
  lng: number;
}

/** Stuttgart Stadtmitte default (.cursorrules). */
const STUTTGART_STADTMITTE: GeoCoords = { lat: 48.7758, lng: 9.176 };

const DEFAULT_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60_000,
  timeout: 12_000
};

@Injectable({
  providedIn: 'root'
})
export class LocationEngineService {
  /**
   * Wraps `navigator.geolocation.getCurrentPosition` in a Promise resolving to `{ lat, lng }`.
   * Rejects if geolocation is unavailable, permission is denied, or the request times out.
   */
  getCurrentPosition(options?: PositionOptions): Promise<GeoCoords> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          reject(err);
        },
        { ...DEFAULT_GEO_OPTIONS, ...options }
      );
    });
  }

  /** Same as {@link getCurrentPosition} but falls back to Stuttgart Stadtmitte on any failure. */
  getPositionOrStuttgartFallback(options?: PositionOptions): Promise<GeoCoords> {
    return this.getCurrentPosition(options).catch(() => STUTTGART_STADTMITTE);
  }

  /**
   * Use only from the authenticated `/dashboard` flow. This is the only path that should call
   * `navigator.geolocation`, so the browser permission prompt never appears before login.
   */
  getCoordsForLoggedInDashboard(options?: PositionOptions): Promise<GeoCoords> {
    return this.getPositionOrStuttgartFallback(options);
  }
}
