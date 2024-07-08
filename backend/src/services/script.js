"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
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
