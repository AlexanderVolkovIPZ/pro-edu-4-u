export const LOT_STATUSES = {
  UPCOMING: 'UPCOMING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  BID_CREATED: 'bidCreated',
  NEW_BID: 'newBid',
  ERROR: 'error',
} as const;
