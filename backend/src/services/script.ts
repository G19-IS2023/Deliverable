import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Assumes "Bearer <token>" format
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized: Malformed token' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Unauthorized: Invalid token' });
    }

    // Store the decoded user info in res.locals for use in your route handlers
    res.locals.user = decoded;
    next();
  });
};