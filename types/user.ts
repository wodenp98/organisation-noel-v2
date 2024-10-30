export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  email?: string;
  emailVerified?: Date;
  gen: number;
  family: string;
  entries?: string;
  flat?: string;
  desserts?: string;
  alcoholSoft?: string;
  pollDate?: string;
  nameOfPoll?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
