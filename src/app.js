import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors({
    origin: process.env.ORIGIN_CORS,
    credentials:true,
}))

app.use(express.json({limit: '20kb'}))
app.use(express.urlencoded({extended:true, limit: "20kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Import routes
import userRoutes from './routes/user.routes.js';


// routes diclaration

app.use("/api/v1/user", userRoutes)

//   http://localhost:3000/api/v1/user/register



export default app