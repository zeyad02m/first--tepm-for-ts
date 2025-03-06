import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import { promises } from 'dns';
import { error } from 'console';
import router from './router';


const app=express();

app.use(cors({
    credentials:true,
}));

app.use(compression()),
app.use(cookieParser()),
app.use(bodyParser.json());

const server=http.createServer(app);

server.listen(3030,()=>{
    console.log(`sever is runing on http://localhost:3030/`);
})

const MONGO_URL ="mongodb+srv://vortex:H3FRsEruGgGhOwGr@myfirstnodejs.trudlza.mongodb.net/vortex?retryWrites=true&w=majority&appName=myfirstnodejs"

mongoose.Promise=promises;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error',(error:Error)=>console.log(error));


app.use('/',router());