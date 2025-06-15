import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import pg from 'pg';

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "booknotes",
  password: "1234",
  port: 5432
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', async (req, res) => {
  try{
    const result = await db.query("SELECT * FROM books");
    res.render("index.ejs", { books: result.rows});
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/add', (req , res) => {
  res.render("new.ejs");
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});