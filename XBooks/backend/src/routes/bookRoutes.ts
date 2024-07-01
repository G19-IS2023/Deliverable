
import express, { Request, Response } from "express";
import User from "../models/user";
import LibraryEntry from "../models/library";
import BookTuple from "../models/book";
import { DatabaseService } from "../services/database";
import { ObjectId } from "mongodb";

const router = express.Router();

const databaseService = DatabaseService.getInstance();

//Funzione per ricavare un book specifico
async function getBookfromLibrary(library: LibraryEntry[], libName: string, bookId: string): Promise<BookTuple | null> {

    const libraryEntry = library.find((entry) => entry.libName == libName) as LibraryEntry | null;
    if(!libraryEntry) return null;

    const bookTuple = libraryEntry.books.find((book) => book.bookId == bookId) as BookTuple | null;
    if(!bookTuple) return null;

    return bookTuple;
}


//API per trovare un libro
router.get("/library/:libName/getBook/:bookId/user/:userId", async (req: Request, res: Response) => {

    try {
    const libName: string = req.params.libName;
    const bookId: string = req.params.bookId;
    const objectId: string = req.params.userId;
    if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);

        const db = await databaseService.getDb();
        const userCollection = db?.collection('users');
        const user = await userCollection?.findOne({ _id: userId}) as User | null;

        if(!user) {
            res.status(401).send("User not found");
            return;
        }

        const library: LibraryEntry[] = user.library;

        const book = getBookfromLibrary(library, libName, bookId);

        if(book) {
            res.status(200).json(book);
        } else {
            res.status(404).send("Book not found");
        }
    } else {
        res.status(400).send("Invalid user id");
    }

    } catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }

});


//API per trovare una specifica libreria
router.get("/getSpecLibrary/:libName/user/:userId", async (req: Request, res: Response) => {

    try {

        const libName: string = req.params.libName;
        const objectId: string = req.params.userId;
        if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);
            const db = await databaseService.getDb();
            const userCollection = db?.collection('users');

            const user = await userCollection?.findOne({ _id: userId}) as User | null;
            if(!user) {
                res.status(401).send("User not found");
            }

            const library = user?.library.find((entry: LibraryEntry) => {
                if(entry.libName == libName) return entry;
                return null;
            }) as LibraryEntry | null;

            if(library) {

                res.status(200).json(library);
                } else {

                res.status(404).send("Library not found");
            }
        } else {
            res.status(400).send("Invalid user id");
        }

    } catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }
});


//API per trovare tutte le librerie
router.get("/getLibrary/:userId", async (req: Request, res: Response) => {

    try {
        
        const objectId: string = req.params.userId;
        if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);

            const db = await databaseService.getDb();
            const userCollection = db?.collection('users');
            const user = await userCollection?.findOne({ _id: userId}) as User | null;

            if(!user) {
                res.status(401).send("User not found");
                return;
            }
        
            const library: LibraryEntry[] = user.library;
        
            res.status(200).json(library);
        } else {
            res.status(400).send("Invalid userId");
        }

    } catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }

});


//API per modificare il numero delle pagine lette
router.put("/modifyPages", async(req: Request, res: Response) => {
    
    try {
        const bookId: string = req.body.bookId;
        const libName: string = req.body.libName;
        const pages: number = req.body.pages;
        const objectId:string = req.body.userId;
        if(ObjectId.isValid(objectId)) {

            const userId: ObjectId = new ObjectId(objectId);

            const db = await databaseService.getDb();
            const user = await db?.collection('users').findOne({ _id: userId }) as User | null;
            if(!user) { return null;}

            const library: LibraryEntry[] = user.library;

            library.forEach((entry) => {
                if(entry.libName == libName) entry.books.forEach((book) => {
                    if(book.bookId == bookId) book.pagesRead = pages;
                })
            })

            await db?.collection('users').updateOne( { _id: userId }, { $set: { library: library } } );

            res.status(200).send("Number of pages read updated");
        } else {    
            res.status(400).send("Invalid userId");
        }

    } catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }
});

export {router as bookRouter};