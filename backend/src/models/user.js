"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class User {
    constructor(name, email, password, library, _id) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.library = library;
        this._id = _id;
        if (this._id && typeof this._id === 'string') {
            try {
                this._id = new mongodb_1.ObjectId(this._id);
            }
            catch (error) {
                throw new Error('Invalid ID format');
            }
        }
    }
}
exports.default = User;
