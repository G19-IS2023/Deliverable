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
const script_1 = require("../services/script");
const router = express_1.default.Router();
exports.bookRouter = router;
const databaseService = database_1.DatabaseService.getInstance();
//API per trovare un libro
router.get("/library/:libId/getBook/:bookId/id/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libId = req.params.libId;
        const bookId = req.params.bookId;
        const userId = req.params.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (!user) {
            res.status(404).send("User not found");
        }
        else {
            const library = user.library;
            const bookPromise = (0, script_1.getBookfromLibrary)(library, libId, bookId);
            const book = yield bookPromise;
            if (book) {
                res.status(200).json(book);
            }
            else {
                res.status(404).send("Book not found");
            }
        }
    }
    catch (error) {
        res.status(500).send("Cannot find the book, try again");
    }
}));
//API per dare true se trova il libro
router.get("/library/:libId/id/:userId/getBook/:bookId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libId = req.params.libId;
        const bookId = req.params.bookId;
        const userId = req.params.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (!user) {
            res.status(404).send("User not found");
        }
        else {
            const library = user.library;
            const bookPromise = (0, script_1.getBookfromLibrary)(library, libId, bookId);
            const book = yield bookPromise;
            if (book) {
                res.status(200).json({ result: true });
            }
            else {
                res.status(404).send("Book not found");
            }
        }
    }
    catch (error) {
        res.status(500).send("Cannot find the book, try again");
    }
}));
//API per trovare una specifica libreria
router.get("/getSpecLibrary/:libId/id/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libId = req.params.libId;
        const userId = req.params.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (!user) {
            res.status(404).send("User not found");
        }
        else {
            const library = user.library.find((lib) => {
                if (lib.libId == libId)
                    return lib;
                return null;
            });
            if (library) {
                res.status(200).json(library);
            }
            else {
                res.status(404).send("Library not found");
            }
        }
    }
    catch (error) {
        res.status(500).send("Cannot find the library, try again");
    }
}));
//API per trovare tutte le librerie
router.get("/getLibraries/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (!user) {
            res.status(404).send("User not found");
        }
        else {
            const library = user.library;
            res.status(200).json(library);
        }
    }
    catch (error) {
        res.status(500).send("Cannot find the libraries, try again");
    }
}));
//API per modificare il numero delle pagine lette
router.put("/modifyPages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.body.bookId;
        const libId = req.body.libId;
        const pages = req.body.pages;
        const userId = req.body.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (!user) {
            res.status(404).send('User not found');
        }
        else {
            const library = user.library;
            library.forEach((lib) => {
                if (lib.libId == libId)
                    lib.books.forEach((book) => {
                        if (book.bookId == bookId)
                            book.pagesRead = pages;
                    });
            });
            yield (db === null || db === void 0 ? void 0 : db.collection('users').updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { library: library } }));
            res.status(200).send("Number of pages read updated");
        }
    }
    catch (error) {
        res.status(500).send("Cannot modify the nuber of pages");
    }
}));
//API per creare una libreria
router.post("/createLibrary", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libName = req.body.libName;
        const libId = req.body.libId;
        const userId = req.body.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (user) {
            const library = user.library;
            const newLibrary = { libName: libName, libId: libId, books: [] };
            library.push(newLibrary);
            yield (db === null || db === void 0 ? void 0 : db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { library: library } }));
            res.status(200).send(`Library: ${libName} created`);
        }
        else {
            res.status(404).send("User not found");
        }
    }
    catch (error) {
        res.status(500).send("Failed to create the library, try again");
    }
}));
//API per aggiungere un libro a una libreria
router.post("/addBook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.body.bookId;
        const libId = req.body.libId;
        const userId = req.body.userId;
        const newBook = { bookId: bookId, pagesRead: 0 };
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (user) {
            const library = user.library;
            library.forEach((lib) => {
                if (lib.libId === libId) {
                    lib.books.push(newBook);
                }
            });
            yield (db === null || db === void 0 ? void 0 : db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { library: library } }));
            res.status(200).send("Book added with success");
        }
        else {
            res.status(404).send("User not found");
        }
    }
    catch (error) {
        res.status(500).send("Cannot add the book");
    }
}));
//API per eliminare un libro da una libreria
router.delete("/library/:libId/deleteBook/:bookId/id/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libId = req.params.libId;
        const bookId = req.params.bookId;
        const userId = req.params.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (user) {
            const library = user.library;
            library.forEach((lib) => {
                if (lib.libId === libId) {
                    lib.books = lib.books.filter((book) => book.bookId !== bookId);
                }
            });
            yield (db === null || db === void 0 ? void 0 : db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { library: library } }));
            res.status(200).send(`Book deleted with success`);
        }
        else {
            res.status(404).send("User not found");
        }
    }
    catch (error) {
        res.status(500).send("Cannot delete the book");
    }
}));
//API per eliminare una libreria
router.delete("/deleteLibrary/:libId/id/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const libId = req.params.libId;
        const userId = req.params.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (user) {
            const library = user.library;
            const updateLibrary = library.filter((lib) => {
                return lib.libId !== libId;
            });
            yield (db === null || db === void 0 ? void 0 : db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { library: updateLibrary } }));
            res.status(200).send(`Library: ${libId} deleted with success`);
        }
        else {
            res.status(404).send("User not found");
        }
    }
    catch (error) {
        res.status(500).send("Cannot delete the library");
    }
}));
