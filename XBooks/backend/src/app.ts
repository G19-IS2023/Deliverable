import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRoutes';
import { bookRouter } from './routes/bookRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/user', userRouter);
app.use('/book', bookRouter);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});