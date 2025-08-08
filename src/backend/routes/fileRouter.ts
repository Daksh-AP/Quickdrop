// filepath: c:\Users\windo\Snapdrop My version\p2p-file-sharing-app\src\backend\routes\fileRoutes.ts
import { Router, Request, Response } from 'express';

export const fileRouter = Router();

fileRouter.get('/', (req: Request, res: Response) => {
  res.send('File router is working!');
});