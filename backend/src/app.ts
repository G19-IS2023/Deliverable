import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRoutes';
import { bookRouter } from './routes/bookRoutes';

dotenv.config({path: '../.env'});

const app = express();
const PORT = process.env.PORT || 5050;

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
  };

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/user', userRouter);
app.use('/book', bookRouter);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});