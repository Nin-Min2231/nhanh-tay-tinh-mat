// Định tuyến hash – phần thuần (không đụng window) để test được.
import { GAME_IDS, type GameId } from '../games/levels';

export type Route =
  | { name: 'profiles' }
  | { name: 'profile-new' }
  | { name: 'home' }
  | { name: 'intro'; gameId: GameId }
  | { name: 'play'; gameId: GameId }
  | { name: 'result' }
  | { name: 'rest' }
  | { name: 'album' }
  | { name: 'parent-gate' }
  | { name: 'parent'; tab: string }
  | { name: 'not-found' };

function isGameId(id: string | undefined): id is GameId {
  return (GAME_IDS as readonly string[]).includes(id ?? '');
}

/** hash: '#/home', '#/play/G1/intro', ... */
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').split('?')[0] ?? '';
  const parts = path.split('/').filter(Boolean);
  const [a, b, c] = parts;
  if (parts.length === 0) return { name: 'home' };
  switch (a) {
    case 'profiles':
      return b === 'new' ? { name: 'profile-new' } : { name: 'profiles' };
    case 'home':
      return { name: 'home' };
    case 'play':
      if (!isGameId(b)) return { name: 'not-found' };
      return c === 'intro' ? { name: 'intro', gameId: b } : { name: 'play', gameId: b };
    case 'result':
      return { name: 'result' };
    case 'rest':
      return { name: 'rest' };
    case 'album':
      return { name: 'album' };
    case 'parent-gate':
      return { name: 'parent-gate' };
    case 'parent':
      return { name: 'parent', tab: b ?? 'progress' };
    default:
      return { name: 'not-found' };
  }
}

export function routePath(r: Route): string {
  switch (r.name) {
    case 'profiles':
      return '/profiles';
    case 'profile-new':
      return '/profiles/new';
    case 'home':
    case 'not-found':
      return '/home';
    case 'intro':
      return `/play/${r.gameId}/intro`;
    case 'play':
      return `/play/${r.gameId}`;
    case 'result':
      return '/result';
    case 'rest':
      return '/rest';
    case 'album':
      return '/album';
    case 'parent-gate':
      return '/parent-gate';
    case 'parent':
      return `/parent/${r.tab}`;
  }
}
