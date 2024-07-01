import { ObjectId } from 'mongodb';
import LibraryEntry from './library';


export default class User {

    constructor(

        public name: string,
        public email: string,
        public password: string,
        public library: LibraryEntry[],
        public id: ObjectId | string
        
    ) {
        if(this.id && typeof this.id === 'string') {
        
        try {

            this.id = new ObjectId(this.id);
        } catch(error) {

            throw new Error('Invalid ID format');
        }
        }
    }
}