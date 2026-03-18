export interface Manufacturer {
  id: string;
  name: string;
  code: string;
}

export const MOCK_MANUFACTURERS: Manufacturer[] = [
  {
    id: '1',
    name: 'Teltonika',
    code: 'TELTONIKA'
  },
  {
    id: '2',
    name: 'Wialon',
    code: 'WIALON'
  }
];
