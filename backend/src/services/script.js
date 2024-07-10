"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.getBookfromLibrary = getBookfromLibrary;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1]; // Assumes "Bearer <token>" format
    if (!token) {
        return res.status(401).send({ error: 'Unauthorized: Malformed token' });
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized: Invalid token' });
        }
        // Store the decoded user info in res.locals for use in your route handlers
        res.locals.user = decoded;
        next();
    });
};
exports.verifyToken = verifyToken;
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validatePassword(password, req, res) {
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
function getBookfromLibrary(library, libId, bookId) {
    return __awaiter(this, void 0, void 0, function* () {
        const libraryEntry = library.find((lib) => lib.libId == libId);
        if (!libraryEntry)
            return null;
        const bookTuple = libraryEntry.books.find((book) => book.bookId == bookId);
        if (!bookTuple)
            return null;
        return bookTuple;
    });
}
