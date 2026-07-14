const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const apiHost = isLocal ? 'http://localhost:3000' : '';
export const apiBase = isLocal ? `${apiHost}/api` : '/api';
export const host = isLocal
  ? 'ws://localhost:3000'
  : `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
