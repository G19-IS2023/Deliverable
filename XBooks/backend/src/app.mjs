import dotenv from 'dotenv';
import cors from 'cors';

const express = require("express");

dotenv.config();
const port = process.env.PORT || 8080;

// Create the app instance and add the router

const app = express();

// CORS requests
app.use(cors());

// Middleware to parse form data

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
export default app;