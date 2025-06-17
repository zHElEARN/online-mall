import { Role } from "@prisma/client";

export interface UserInfo {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: Role;
  avatar: string | null;
  realName: string | null;
  createdAt: Date;
  updatedAt: Date;
}
