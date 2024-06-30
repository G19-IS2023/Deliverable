import express, { Request, Response} from 'express';
import User from '../models/user';
import { DatabaseService } from '../services/database';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const databaseService = new DatabaseService(process.env.DB_CONN_STRING!, process.env.DB_NAME!);

router.use(express.json());

router.get('/getUser/:id', async(req: Request, res: Response) => {

    try{

        const db = databaseService.getDb();
        const id = new ObjectId(req.params.id);
        const User = await db?.collection('users').findOne( { _id: id } );
        res.status(200).json(User);

    }catch(error: any) {
        res.status(500).json({ message: error.message })
    }
    
});

router.post('/login', async(req: Request, res: Response) => {

    const db = databaseService.getDb();

    const searchEmail = req.body.email;

    const possibleUser = await db?.collection( 'users' ).findOne({email: searchEmail }) as User | null;
    if(!possibleUser) { 
        return res.status(400).send('Cannot find user');
    }

    try {

        if(await bcrypt.compare(req.body.password, possibleUser.password)) {
            const accessToken = jwt.sign({ email: possibleUser.email, _id: possibleUser.id }, process.env.ACCESS_TOKEN_SECRET!);
            res.json({ accessToken: accessToken });
        } else {
            res.status(403).send('Not allowed');
        }
    } catch (error: any) {
        res.status(500).send('Server error');
    }
});

router.post('/register', async (req: Request, res: Response) => {

    try{

        const { name, email, password, library, id } = req.body;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User(name, email, hashedPassword, library, id);

        const db = databaseService.getDb();
        const result = await db?.collection('users').insertOne(user);

        res.status(201).json(result);

    }catch(error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/modifyUsername', async (req: Request, res: Response) => {

    try {
        const { userId, newUsername } = req.body;

        const db = databaseService.getDb();
        await db?.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { username: newUsername } });

        res.status(200).send('Succesfully updated');
    } catch(error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/modifyPassword', async (req: Request, res: Response) => {

    try {
        const { userId, oldPassword, newPassword } = req.body;

        const db = databaseService.getDb();
        const user = await db?.collection('users').findOne({ _id: new ObjectId(userId) }) as User | null;

        if(!user) {
            res.status(401).send('Cannot find the user');
            return;
        }

        if(await bcrypt.compare(oldPassword, user.password)) {

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await db?.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { password: hashedPassword } });
            res.status(200).send('Succesfully updated');
        } else {
            
            res.status(403).send('Old password is incorrect');
        }

    } catch(error: any) {
        res.status(400).json({ message: error.message });
    }
});

export { router as userRouter };