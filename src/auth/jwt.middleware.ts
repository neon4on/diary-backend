import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DiaryRole } from '../common/enums/diary-role.enum';

const DIARY_SRV_ID = 11;

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as any;

    const diaryAccess = decoded?.right?.find(
      (r: any) => r.srv_id === DIARY_SRV_ID,
    );

    if (!diaryAccess) {
      return res.status(403).json({ error: 'NO_ACCESS_TO_DIARY' });
    }

    (req as any).user = {
      id: decoded.sub,
      name: decoded.name,
      role: diaryAccess.role_id as DiaryRole,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}