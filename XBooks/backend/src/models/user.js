"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class User {
    constructor(name, email, password, library, id) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.library = library;
        this.id = id;
        if (this.id && typeof this.id === 'string') {
            try {
                this.id = new mongodb_1.ObjectId(this.id);
            }
            catch (error) {
                throw new Error('Invalid ID format');
            }
        }
    }
}
exports.default = User;
