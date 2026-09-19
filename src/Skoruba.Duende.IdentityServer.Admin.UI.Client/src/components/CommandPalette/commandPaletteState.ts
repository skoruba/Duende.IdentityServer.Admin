// Router location state that asks the Clients page to open the new client wizard.
export const OPEN_NEW_CLIENT_STATE = { openNewClient: true } as const;

export const shouldOpenNewClient = (state: unknown): boolean =>
  typeof state === "object" &&
  state !== null &&
  (state as { openNewClient?: unknown }).openNewClient === true;
