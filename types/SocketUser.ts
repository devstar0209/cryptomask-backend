export type SocketUser = {
  id: number;
  address: string;
  isAdmin: boolean;
  seedPhraseBackedUp: boolean;
  isDeactivated: boolean;
  isTransactionBlocked: boolean;
  subAddress: string[];
};
