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
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const database_1 = require("../services/database");
const mongodb_1 = require("mongodb");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
exports.userRouter = router;
const databaseService = database_1.DatabaseService.getInstance();
//API per inviare l'User
router.get('/getUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield databaseService.getDb();
        const objectId = req.params.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const User = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: userId }));
            if (User) {
                res.status(200).json(User);
            }
            else {
                res.status(404).json({ message: 'User not found' });
            }
        }
        else {
            res.status(400).json({ message: 'Invalid id' });
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
//API per verificare le credenziali e inviare l'accessToken
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield databaseService.getDb();
    const searchEmail = req.body.email;
    const possibleUser = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ email: searchEmail }));
    if (!possibleUser) {
        return res.status(400).send('Cannot find user');
    }
    try {
        if (yield bcryptjs_1.default.compare(req.body.password, possibleUser.password)) {
            const accessToken = jsonwebtoken_1.default.sign({ email: possibleUser.email, _id: possibleUser.id }, process.env.ACCESS_TOKEN_SECRET);
            res.status(200).json({ accessToken: accessToken });
        }
        else {
            res.status(403).send('Not allowed');
        }
    }
    catch (error) {
        res.status(500).send('Server error');
    }
}));
//API per registrare l'User e criptare la password
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const library = [];
        const objectId = req.body.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const salt = yield bcryptjs_1.default.genSalt();
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const user = new user_1.default(name, email, hashedPassword, library, userId);
            if (user) {
                const db = yield databaseService.getDb();
                const result = yield (db === null || db === void 0 ? void 0 : db.collection("users").insertOne(user));
                res.status(201).json(result);
            }
            else {
                res.status(400).send('User not created');
            }
        }
        else {
            res.status(404).send('Invalid user id');
        }
    }
    catch (error) {
        res.status(401).send("Cannot complete the task");
    }
}));
//API per modificare l'username
router.put('/modifyUsername', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectId = req.body.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const newUsername = req.body.newUsername;
            const db = yield databaseService.getDb();
            yield (db === null || db === void 0 ? void 0 : db.collection("users").updateOne({ _id: userId }, { $set: { username: newUsername } }));
            res.status(200).send('Succesfully updated');
        }
        else {
            res.status(400).send('Invalid ObjectId');
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
//API per modificare la password
router.put('/modifyPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectId = req.body.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;
            const db = yield databaseService.getDb();
            const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: userId }));
            if (!user) {
                res.status(401).send('Cannot find the user');
                return;
            }
            if (yield bcryptjs_1.default.compare(oldPassword, user.password)) {
                const salt = yield bcryptjs_1.default.genSalt();
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
                yield (db === null || db === void 0 ? void 0 : db.collection("users").updateOne({ _id: userId }, { $set: { password: hashedPassword } }));
                res.status(200).send('Succesfully updated');
            }
            else {
                res.status(403).send('Old password is incorrect');
            }
        }
        else {
            res.status(400).send('Invalid user id');
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
//API per eliminare l'account
router.delete("/deleteProfile/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectId = req.params.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            const userId = new mongodb_1.ObjectId(objectId);
            const db = yield databaseService.getDb();
            const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: userId }));
            if (!user) {
                res.status(401).send('Cannot find user');
                return;
            }
            yield (db === null || db === void 0 ? void 0 : db.collection('users').deleteOne({ _id: userId }));
            res.status(200).send('Succesfully deleted');
        }
        else {
            res.status(400).send('Invalid user id');
        }
    }
    catch (error) {
        res.status(400).send("Cannot complete the task");
    }
}));
