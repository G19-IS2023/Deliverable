import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});