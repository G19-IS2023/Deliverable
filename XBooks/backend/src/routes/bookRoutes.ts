import express, { Request, Response } from "express";
import User from "../models/user";
import LibraryEntry from "../models/library";
import BookTuple from "../models/book";
import { DatabaseService } from "../services/database";
import { ObjectId, OrderedBulkOperation } from "mongodb";

const router = express.Router();

const databaseService = DatabaseService.getInstance();

//Funzione per ricavare un book specifico
async function getBookfromLibrary(library: LibraryEntry[], libName: string, bookId: string): Promise<BookTuple | null> {

    const libraryEntry = library.find((lib) => lib.libName == libName) as LibraryEntry | null;
    if(!libraryEntry) return null;

    const bookTuple = libraryEntry.books.find((book) => book.bookId == bookId) as BookTuple | null;
    if(!bookTuple) return null;

    return bookTuple;
}


//API per trovare un libro
router.get("/library/:libName/getBook/:bookId/id/:userId", async (req: Request, res: Response) => {

    try {
    const libName: string = req.params.libName;
    const bookId: string = req.params.bookId;
    const userId: string = req.params.userId;

    if(ObjectId.isValid(userId)) {

        const db = await databaseService.getDb();
        const userCollection = db?.collection('users');
        const user = await userCollection?.findOne({ _id: new ObjectId(userId)}) as User | null;

        if(!user) {
            res.status(404).send("User not found");
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
        res.status(404).send("Cannot find the book, try again");
    }

});


//API per trovare una specifica libreria
router.get("/getSpecLibrary/:libName/id/:userId", async (req: Request, res: Response) => {

    try {

        const libName: string = req.params.libName;
        const userId: string = req.params.userId;

        if(ObjectId.isValid(userId)) {

            const db = await databaseService.getDb();
            const userCollection = db?.collection('users');

            const user = await userCollection?.findOne({ _id: new ObjectId(userId)}) as User | null;
            if(!user) {
                res.status(404).send("User not found");
            }

            const library = user?.library.find((lib: LibraryEntry) => {
                if(lib.libName == libName) return lib;
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
        res.status(404).send("Cannot find the library, try again");
    }
});


//API per trovare tutte le librerie
router.get("/getLibraries/:userId", async (req: Request, res: Response) => {

    try {
        
        const userId: string = req.params.userId;

        if(ObjectId.isValid(userId)) {

            const db = await databaseService.getDb();

            const user = await db?.collection("users").findOne({ _id: new ObjectId(userId)}) as User | null;

            if(!user) {
                res.status(404).send("User not found");
                return;
            }
        
            const library: LibraryEntry[] = user.library;
        
            res.status(200).json(library);
        } else {
            res.status(400).send("Invalid userId");
        }

    } catch(error: any) {
        res.status(404).send("Cannot find the libraries, try again");
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

            library.forEach((lib) => {
                if(lib.libName == libName) lib.books.forEach((book) => {
                    if(book.bookId == bookId) book.pagesRead = pages;
                });
            });

            await db?.collection('users').updateOne( { _id: userId }, { $set: { library: library } } );

            res.status(200).send("Number of pages read updated");
        } else {    
            res.status(404).send("Invalid userId");
        }

    } catch(error: any) {
        res.status(400).send("Cannot modify the nuber of pages");
    }
});


//API per creare una libreria
router.post("/createLibrary", async (req: Request, res: Response) => {

    try {

        const libName: string = req.body.libName;
        const userId: string = req.body.userId;
        
        const db = await databaseService.getDb();
        const user = await db?.collection("users").findOne({ _id: new ObjectId(userId) }) as User | null;

        if(user) {

            const library: LibraryEntry[] = user.library;
            const newLibrary: LibraryEntry = { libName: libName as string, books: [] as BookTuple[]};
            library.push(newLibrary);
            
            await db?.collection("users").updateOne( { _id: new ObjectId(userId) }, { $set: { library: library } } );

            res.status(200).send(`Library: ${libName} created`);
        } else {
            res.status(404).send("User not found");
        }

    }catch(error: any) {
        res.status(400).send("Failed to create the library, try again");
    }
});


//API per aggiungere un libro a una libreria
router.post("/addBook", async(req: Request, res: Response) => {

    try{ 
        const bookId: string = req.body.bookId;
        const libName: string = req.body.libName;
        const userId: string = req.body.userId;
        
        const newBook: BookTuple = { bookId: bookId, pagesRead: 0 };

        const db = await databaseService.getDb(); 
        const user = await db?.collection("users").findOne({ _id: new ObjectId(userId) }) as User | null;

        if(user) {

            const library: LibraryEntry[] = user.library;

            library.forEach((lib) => {
                if(lib.libName === libName) {
                    lib.books.push(newBook);
                }
            });

            await db?.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { library: library } });

            res.status(200).send("Book added with success");

        } else {
            res.status(404).send("User not found");
        }

    } catch(error: any) {
        res.status(400).send("Cannot add the book");
    }
});



//API per eliminare un libro da una libreria
router.delete("/library/:libName/deleteBook/:bookId/id/:userId", async (req: Request, res: Response) => {
    try {

        const libName: string = req.params.libName;
        const bookId: string = req.params.bookId;
        const userId: string = req.params.userId;

        const db = await databaseService.getDb();

        const user = await db?.collection("users").findOne({ _id: new ObjectId(userId) }) as User | null;

        if(user) {

            const library: LibraryEntry[] = user.library;

            library.forEach((lib) => {

                if(lib.libName === libName) {
                    lib.books = lib.books.filter((book) => book.bookId !== bookId) as BookTuple[];
                }
            });

            await db?.collection("users").updateOne( { _id: new ObjectId(userId) }, {$set: { library: library}});

            res.status(200).send(`Book deleted with success`);
            
        } else {
            res.status(404).send("User not found");
        }

    } catch(error: any) {
        res.status(400).send("Cannot delete the book");
    }
});


//API per eliminare una libreria
router.delete("/deleteLibrary/:libName/id/:userId", async (req: Request, res: Response) => {

    try {

        const libName: string = req.params.libName;
        const userId: string = req.params.userId;

        const db = await databaseService.getDb();
        const user = await db?.collection("users").findOne({ _id: new ObjectId(userId) }) as User | null;

        if(user) {
            const library: LibraryEntry[] = user.library;

            const updateLibrary = library.filter((lib) => {
                return lib.libName !== libName;
            }) as LibraryEntry[];

            await db?.collection("users").updateOne({ _id: new ObjectId(userId) }, {  $set: { library: updateLibrary }});

            res.status(200).send(`Library: ${libName} deleted with success`);
        } else {
            res.status(404).send("User not found");
        }

    } catch(error: any) {
        res.status(400).send("Cannot delete the library");
    }
});

export {router as bookRouter};