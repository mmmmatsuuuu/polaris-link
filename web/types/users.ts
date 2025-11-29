import type { TimestampIsoString } from "./catalog";

export type UserRole = "teacher" | "student";

type BaseUser = {
  id: string;
  role: UserRole;
  email: string;
  displayName: string;
  notes?: string;
  createdAt: TimestampIsoString;
  lastLogin?: TimestampIsoString;
};

export type TeacherUser = BaseUser & {
  role: "teacher";
};

export type StudentUser = BaseUser & {
  role: "student";
  studentNumber: number;
};

export type User = TeacherUser | StudentUser;
