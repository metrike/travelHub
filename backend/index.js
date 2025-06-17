import express from 'express';
import cors from 'cors';
import offersRoute from './routes/offers.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/offers', offersRoute);

app.listen(8000, () => console.log("API listening on port 8000"));
