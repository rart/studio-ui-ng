export interface User {
  id?: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  password?: string;
  // groups: Array<number>;
  // expired: boolean;
  // locked: boolean;
  // credentialsExpired: boolean;
  authenticationType: string;
  externallyManaged: boolean;
  avatarUrl: string;
}
