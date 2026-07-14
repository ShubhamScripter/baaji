const isLocal = import.meta.env.VITE_IS_LOCAL !== 'false';

export const apiHost = isLocal ? 'http://localhost:3000' : '';
export const apiBase = isLocal ? `${apiHost}/api` : '/api';
export const host = isLocal
  ? 'ws://localhost:3000'
  : `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
