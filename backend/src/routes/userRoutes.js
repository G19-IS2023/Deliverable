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
const script_1 = require("../services/script");
const router = express_1.default.Router();
exports.userRouter = router;
const databaseService = database_1.DatabaseService.getInstance();
//API per inviare l'User
router.get('/getUser/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield databaseService.getDb();
        const userId = req.params.userId;
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).send("User not found");
        }
    }
    catch (error) {
        res.status(500).send("Unable to find the user, try again");
    }
}));
//API per verificare le credenziali e inviare l'accessToken
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield databaseService.getDb();
        const searchEmail = req.body.email;
        const possibleUser = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ email: searchEmail }));
        if (!possibleUser) {
            return res.status(404).send('Cannot find user');
        }
        if (yield bcryptjs_1.default.compare(req.body.password, possibleUser.password)) {
            const accessToken = jsonwebtoken_1.default.sign({ email: possibleUser.email, _id: possibleUser._id }, process.env.ACCESS_TOKEN_SECRET);
            res.set('Authorization', `Bearer ${accessToken}`);
            res.status(200).json({ userId: possibleUser._id });
        }
        else {
            res.status(401).send('Wrong password');
        }
    }
    catch (error) {
        res.status(500).send('Unable to login, try again');
    }
}));
//API per registrare l'User e criptare la password
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const predLibrary = { libName: "Default", libId: "1", books: [] };
        const library = [predLibrary]; //Setta libreria predefinita
        const objectId = req.body.userId;
        if (mongodb_1.ObjectId.isValid(objectId)) {
            if ((0, script_1.validateEmail)(email)) {
                if ((0, script_1.validatePassword)(password, req, res)) {
                    const userId = new mongodb_1.ObjectId(objectId);
                    const salt = yield bcryptjs_1.default.genSalt();
                    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                    const db = yield databaseService.getDb();
                    const existEmail = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ email: email }));
                    const existUsername = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ name: name }));
                    if (!existEmail) {
                        if (!existUsername) {
                            const user = new user_1.default(name, email, hashedPassword, library, userId);
                            if (user) {
                                const result = yield (db === null || db === void 0 ? void 0 : db.collection("users").insertOne(user));
                                res.status(201).json(result);
                            }
                            else {
                                res.status(500).send('User not created due to a database problem');
                            }
                        }
                        else {
                            res.status(409).send('Username already exists');
                        }
                    }
                    else {
                        res.status(409).send('Email already used');
                    }
                }
            }
            else {
                res.status(406).send('Invalid email');
            }
        }
        else {
            res.status(406).send('Invalid user id');
        }
    }
    catch (error) {
        res.status(500).send("Unable to register the user, try again");
    }
}));
//API per modificare l'username
router.put('/modifyUsername', script_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        const newUsername = req.body.newUsername;
        const db = yield databaseService.getDb();
        const existUsername = yield (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ name: newUsername }));
        if (!existUsername) {
            yield (db === null || db === void 0 ? void 0 : db.collection('users').updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { name: newUsername } }));
            res.status(200).send('Succesfully updated');
        }
        else {
            res.status(409).send("Username already exist");
        }
    }
    catch (error) {
        res.status(500).send("Unable to update the username, try again");
    }
}));
//API per modificare la password
router.put('/modifyPassword', script_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (!user) {
            res.status(404).send('Cannot find the user');
        }
        else {
            if ((0, script_1.validatePassword)(newPassword, req, res)) {
                if (yield bcryptjs_1.default.compare(oldPassword, user.password)) {
                    const salt = yield bcryptjs_1.default.genSalt();
                    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
                    yield (db === null || db === void 0 ? void 0 : db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { password: hashedPassword } }));
                    res.status(200).send('Succesfully updated');
                }
                else {
                    res.status(401).send('Old password is incorrect');
                }
            }
            else {
                res.status(406).send('New password is not valid');
            }
        }
    }
    catch (error) {
        res.status(500).send("Unable to update the password, try again");
    }
}));
//API per eliminare l'account
router.delete("/deleteProfile/:userId", script_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const db = yield databaseService.getDb();
        const user = yield (db === null || db === void 0 ? void 0 : db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) }));
        if (!user) {
            res.status(404).send('Cannot find user');
            return;
        }
        else {
            yield (db === null || db === void 0 ? void 0 : db.collection('users').deleteOne({ _id: new mongodb_1.ObjectId(userId) }));
            res.status(200).send('Succesfully deleted');
        }
    }
    catch (error) {
        res.status(500).send("Unable to delete the account, try again");
    }
}));
