// Dependencies.
import routes from './routes/index.js';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
// Open the database.
const dbPath = path.join(process.cwd()+'/database.db');
console.log('Connecting to database at: ' + dbPath);
const db = await open({
  filename: dbPath,
  driver: sqlite3.Database
})
app.set('db', db); // Store connection as app setting.

// Initialize routing.
app.use(express.json());
app.use(routes);

// Serve a static html page in case of a root route GET.
app.use(express.static(process.cwd()+'/src/public'));
app.get('/', function(req,res) {
    res.sendFile(process.cwd()+'/src/public/index.html');
})

// Begin listening.
const port = +process.env.PORT; // + converts to numeral
var server = app.listen(port, function () {
    console.log('A Paint Company API listening on port ' + port);
})