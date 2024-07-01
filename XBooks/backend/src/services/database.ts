import { MongoClient, Db } from "mongodb";

export class DatabaseService {

    private static instance: DatabaseService;
    private client?: MongoClient;
    private db?: Db;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    
    public async getDb() : Promise<Db> {

        if(!this.client) {
            this.client = new MongoClient(process.env.DB_CONN_STRING!);
            await this.client.connect();
            this.db = this.client.db(process.env.DB_NAME!);
        }

        return this.db!;
    }
}