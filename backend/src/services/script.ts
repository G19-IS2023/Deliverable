import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import LibraryEntry from '../models/library';
import BookTuple from '../models/book';

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

export function validateEmail (email: string): boolean {

  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
 
  return re.test(String(email).toLowerCase());
}

export function validatePassword(password: string, req: Request, res: Response): boolean {
  // Verifica la lunghezza minima di 8 caratteri
  if (password.length < 8) {
      res.status(400).send("La password deve essere di almeno 8 caratteri.");
      return false;
  }

  // Verifica la presenza di almeno una lettera
  if (!/[a-zA-Z]/.test(password)) {
      res.status(400).send("La password deve contenere almeno una lettera.");
      return false;
  }

  // Verifica la presenza di almeno un numero
  if (!/\d/.test(password)) {
      res.status(400).send("La password deve contenere almeno un numero.");
      return false;
  }

  // Verifica la presenza di almeno un carattere speciale tra i seguenti: ? ! . _ - @ |
  if (!/[?!._\-@|]/.test(password)) {
      res.status(400).send("La password deve contenere almeno uno dei seguenti caratteri speciali: ? ! . _ - @ |");
      return false;
  }

  // Se tutti i controlli sono superati, la password è valida
  return true;
}

//Funzione per ricavare un book specifico
export async function getBookfromLibrary(library: LibraryEntry[], libId: string, bookId: string): Promise<BookTuple | null> {

  const libraryEntry = library.find((lib) => lib.libId == libId) as LibraryEntry | null;
  if(!libraryEntry) return null;

  const bookTuple = libraryEntry.books.find((book) => book.bookId == bookId) as BookTuple | null;

  if(!bookTuple) return null;

  return bookTuple;
}