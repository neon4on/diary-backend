import 'express-session';

declare module 'express-session' {
  interface SessionData {
    uid?: number;
    user?: {
      id: number;
      name: string;
      roleId: number;
    };
  }
}