import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
app = express();

app.use(cors({
    origin: process.env.ORIGIN_CORS,
    credentials:true,
}))

app.use(express.json({limit: '20kb'}))
app.use(express.urlencoded({extended:true, limit: "20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

export default app