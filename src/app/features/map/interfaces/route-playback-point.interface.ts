export interface RoutePlaybackPoint {
  index: number;
  latitude: number;
  longitude: number;
  speedKph: number;
  heading: number | null;
  fixTimeUtc: string;
  status: 'moving' | 'stopped';
}
