export type UserData = {
  id: string;
  userName: string;
  email: string;
};

export type UsersData = {
  items: UserData[];
  totalCount: number;
};

export interface PersistedGrant {
  id: number;
  key: string;
  type: string;
  subjectId: string;
  subjectName: string;
  clientId: string;
  creationTime: string;
  expiration?: string;
  consumedTime?: string;
  sessionId: string;
  description: string;
}
