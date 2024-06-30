import { MongoClient, Db } from "mongodb";

export class DatabaseService {

    private db?: Db;

    constructor(private dbConnString: string, private dbName: string) {}

    async connect() {

        const client = new MongoClient(this.dbConnString);
        await client.connect();
        this.db = client.db(this.dbName);
        console.log('Connected to MongoDB');
    }
    
    getDb() : Db | undefined {

        return this.db;
    }
}