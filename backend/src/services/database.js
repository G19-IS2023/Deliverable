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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const mongodb_1 = require("mongodb");
class DatabaseService {
    constructor() { }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    getDb() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client || !this.db) {
                if (!process.env.DB_CONN_STRING || !process.env.DB_NAME) {
                    throw new Error('Database connection configuration is missing.');
                }
                this.client = new mongodb_1.MongoClient(process.env.DB_CONN_STRING);
                try {
                    yield this.client.connect();
                    this.db = this.client.db(process.env.DB_NAME);
                }
                catch (error) {
                    console.error('Failed to connect to the database:', error);
                    throw error;
                }
            }
            return this.db;
        });
    }
}
exports.DatabaseService = DatabaseService;
