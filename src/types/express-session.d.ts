import 'express-session';

declare module 'express-session' {
  interface SessionData {
    uid: number;
    right: string[];
    status: number; // 1 = active, 0 = left
  }
}