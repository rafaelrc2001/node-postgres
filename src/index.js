import express from 'express';
import morgan from 'morgan';
import { Pool } from 'pg';
import { PORT } from './config.js';
import usersRouter from './routes/users.routers.js';


const app = express();


app.use(express.json());
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});

app.use(usersRouter);
