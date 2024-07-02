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
exports.bookRouter = void 0;
const express_1 = __importDefault(require("express"));
const database_1 = require("../services/database");
const mongodb_1 = require("mongodb");
const router = express_1.default.Router();
exports.bookRouter = router;
const databaseService = database_1.DatabaseService.getInstance();
//Funzione per ricavare un book specifico
function getBookfromLibrary(library, libName, bookId) {
    return __awaiter(this, void 0, void 0, function* () {
        const libraryEntry = library.find((entry) => entry.libName == libName);
        if (!libraryEntry)
            return null;
        const bookTuple = libraryEntry.books.find((book) => book.bookId == bookId);
        if (!bookTuple)
            return null;
        return bookTuple;
    });
}
//API per trovare un libro
router.get("/library/:libName/getBook/:bookId/id/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libName = req.params.libName;
        const bookId = req.params.bookId;
        const objectId = req.params.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const db = yield databaseService.getDb();
            const userCollection = db === null || db === void 0 ? void 0 : db.collection('users');
            const user = yield (userCollection === null || userCollection === void 0 ? void 0 : userCollection.findOne({ _id: userId }));
            if (!user) {
                res.status(401).send("User not found");
                return;
            }
            const library = user.library;
            const book = getBookfromLibrary(library, libName, bookId);
            if (book) {
                res.status(200).json(book);
            }
            else {
                res.status(404).send("Book not found");
            }
        }
        else {
            res.status(400).send("Invalid user id");
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
//API per trovare una specifica libreria
router.get("/getSpecLibrary/:libName/id/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libName = req.params.libName;
        const objectId = req.params.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const db = yield databaseService.getDb();
            const userCollection = db === null || db === void 0 ? void 0 : db.collection('users');
            const user = yield (userCollection === null || userCollection === void 0 ? void 0 : userCollection.findOne({ _id: userId }));
            if (!user) {
                res.status(401).send("User not found");
            }
            const library = user === null || user === void 0 ? void 0 : user.library.find((entry) => {
                if (entry.libName == libName)
                    return entry;
                return null;
            });
            if (library) {
                res.status(200).json(library);
            }
            else {
                res.status(404).send("Library not found");
            }
        }
        else {
            res.status(400).send("Invalid user id");
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
//API per trovare tutte le librerie
router.get("/getLibraries/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectId = req.params.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const db = yield databaseService.getDb();
            const userCollection = db === null || db === void 0 ? void 0 : db.collection('users');
            const user = yield (userCollection === null || userCollection === void 0 ? void 0 : userCollection.findOne({ _id: userId }));
            if (!user) {
                res.status(401).send("User not found");
                return;
            }
            const library = user.library;
            res.status(200).json(library);
        }
        else {
            res.status(400).send("Invalid userId");
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
//API per modificare il numero delle pagine lette
router.put("/modifyPages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.body.bookId;
        const libName = req.body.libName;
        const pages = req.body.pages;
        const objectId = req.body.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const db = yield databaseService.getDb();
            const user = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: userId }));
            if (!user) {
                return null;
            }
            const library = user.library;
            library.forEach((entry) => {
                if (entry.libName == libName)
                    entry.books.forEach((book) => {
                        if (book.bookId == bookId)
                            book.pagesRead = pages;
                    });
            });
            yield (db === null || db === void 0 ? void 0 : db.collection('users').updateOne({ _id: userId }, { $set: { library: library } }));
            res.status(200).send("Number of pages read updated");
        }
        else {
            res.status(400).send("Invalid userId");
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
