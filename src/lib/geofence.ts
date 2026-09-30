const CAMPUS_LAT = 20.96227476797624;
const CAMPUS_LNG = 75.55374579443586;
const RADIUS_METERS = 400;

function getDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface GeofenceResult {
  allowed: boolean;
  reason?: string;
  distance?: number;
}

export function checkGeofence(): Promise<GeofenceResult> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({ allowed: false, reason: 'Location services are not supported on this device.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = getDistanceInMeters(CAMPUS_LAT, CAMPUS_LNG, pos.coords.latitude, pos.coords.longitude);
        if (distance <= RADIUS_METERS) {
          resolve({ allowed: true, distance });
        } else {
          resolve({
            allowed: false,
            reason: `You appear to be ${Math.round(distance)}m from campus. You must be within ${RADIUS_METERS}m to join a queue.`,
            distance,
          });
        }
      },
      (err) => {
        let reason = 'Unable to verify your location.';
        if (err.code === err.PERMISSION_DENIED) reason = 'Location permission is required to join a queue. Please allow location access and try again.';
        else if (err.code === err.TIMEOUT) reason = 'Location request timed out. Please try again with a clear GPS signal.';
        resolve({ allowed: false, reason });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}