import { ObjectId } from 'mongodb';

export default class User {

    constructor(

        public name: string,
        public email: string,
        public password: string,
        public library: string,
        public id?: ObjectId | string
        
    ) {
        if(this.id && this.id === 'string') {
            this.id = new ObjectId(this.id);
        }
    }
}