import express, { Request, Response} from 'express';
import User from '../models/user';
import { DatabaseService } from '../services/database';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import LibraryEntry from '../models/library';

const router = express.Router();

const databaseService = DatabaseService.getInstance();


//API per inviare l'User
router.get('/getUser/:id', async(req: Request, res: Response) => {

    try{

        const db = await databaseService.getDb();
        const objectId: string = req.params.userId;
        if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);
            const User = await db?.collection('users').findOne( { _id: userId } ) as User | null;
            
            if(User) {
                res.status(200).json(User);
            } else {
                res.status(404).json({message: 'User not found'});
            }
        } else {
            res.status(400).json({message: 'Invalid id'});
        }

    }catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }
    
});


//API per verificare le credenziali e inviare l'accessToken
router.post('/login', async(req: Request, res: Response) => {

    const db = await databaseService.getDb();

    const searchEmail: string = req.body.email;

    const possibleUser = await db?.collection( 'users' ).findOne({email: searchEmail }) as User | null;
    
    if(!possibleUser) { 
        return res.status(400).send('Cannot find user');
    }

    try {

        if(await bcrypt.compare(req.body.password, possibleUser.password)) {

            const accessToken = jwt.sign({ email: possibleUser.email, _id: possibleUser.id }, process.env.ACCESS_TOKEN_SECRET!);
            res.status(200).json({ accessToken: accessToken });
        } else {
            
            res.status(403).send('Not allowed');
        }
    } catch (error: any) {
        res.status(500).send('Server error');
    }
});


//API per registrare l'User e criptare la password
router.post('/register', async (req: Request, res: Response) => {

    try{

        const name: string = req.body.name;
        const email: string = req.body.email;
        const password: string = req.body.password;
        const library: LibraryEntry[] = [];
        const objectId: string = req.body.userId;
        if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt) as string;

            const user = new User(name, email, hashedPassword, library, userId) as User | null;

            if(user) {
            const db = await databaseService.getDb();
            const result = await db?.collection('users').insertOne(user);

            res.status(201).json(result);
        
            } else {
                res.status(400).send('User not created');
            }
        } else {
            res.status(400).send('Invalid user id');
        }

    }catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }
});


//API per modificare l'username
router.put('/modifyUsername', async (req: Request, res: Response) => {

    try {

        const objectId: string = req.body.userId;
        if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);
            const newUsername: string = req.body.newUsername;

            const db = await databaseService.getDb();
            await db?.collection('users').updateOne({ _id: userId }, { $set: { username: newUsername } });

            res.status(200).send('Succesfully updated');
        } else {
            res.status(400).send('Invalid ObjectId');
        }
    } catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }
});


//API per modificare la password
router.put('/modifyPassword', async (req: Request, res: Response) => {

    try {
        const objectId: string = req.body.userId;
        if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);
        
            const oldPassword: string = req.body.oldPassword;
            const newPassword: string = req.body.newPassword;


            const db = await databaseService.getDb();
            const user = await db?.collection('users').findOne({ _id: userId }) as User | null;

            if(!user) {
                res.status(401).send('Cannot find the user');
                return;
            }

            if(await bcrypt.compare(oldPassword, user.password)) {

                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(newPassword, salt);

                await db?.collection('users').updateOne({ _id: userId }, { $set: { password: hashedPassword } });
                res.status(200).send('Succesfully updated');
            } else {

                res.status(403).send('Old password is incorrect');
            }
        }else {
            res.status(400).send('Invalid user id');
        }
    } catch(error: any) {
        res.status(400).send("Cannot complete the task");
    }
});


//API per eliminare l'account
router.delete("/deleteProfile/:id", async (req: Request, res: Response) => {


    try {

        const objectId: string = req.params.userId;
        if(ObjectId.isValid(objectId)) {
            const userId: ObjectId = new ObjectId(objectId);
            const db = await databaseService.getDb();
            const user = await db?.collection('users').findOne( { _id: userId } ) as User | null;

            if(!user) {
                res.status(401).send('Cannot find user');
                return;
            }

            await db?.collection('users').deleteOne({ _id: userId });
            res.status(200).send('Succesfully deleted');
        } else {
            res.status(400).send('Invalid user id');
        }
    } catch(error: any) {

        res.status(400).send("Cannot complete the task");
    }


});

export { router as userRouter };