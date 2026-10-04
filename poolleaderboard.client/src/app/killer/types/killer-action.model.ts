/** An action on the killer page that makes a network request. Only one may be in flight at a time. */
export type KillerAction = 'pot' | 'miss' | 'earlyBlackPot' | 'undo' | 'abandon' | 'confirmEnd';
