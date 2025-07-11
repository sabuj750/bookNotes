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
app.set("view engine", "ejs");
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

app.post("/add" , async (req , res) => {
  try{
    const details = req.body;
    const title = details.title;
    const author = details.author;
    const review = details.review;
    const rating = details.rating;
    const date_read = details.date_read;

    const response = await axios.get(`http://openlibrary.org/search.json?title=${title}`);
    const coverId = response.data.docs[0]?.cover_i;
    const cover_Url = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;

    await db.query("INSERT INTO books (title , author, cover_url , rating , review , date_read ) VALUES($1 , $2 , $3 , $4 , $5 , $6)",[title, author, cover_Url , rating , review , date_read]);

    res.redirect("/");

  }catch(error){
    console.error("Error adding book:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/delete/:id", async (req , res) => {
  try{
    const id = req.params.id;
    await db.query("DELETE FROM books WHERE id = $1",[id]);
    res.status(200).json({ success: true });
    // res.status(200).send("Book deleted successfully");
  }catch(error){
    console.error("Error deleting book:", error);
    res.status(500).send("Internal Server Error!!");
  }
});

app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    if(result.rows.length > 0){
      const book = result.rows[0];
      console.log("Book found:", book);
      res.render("new.ejs", { book });
    }else{
      res.status(404).send("Book not found");
    }
  }catch(error){
    console.error("Error fetching book:", error);
  }
});

app.post('/edit/:id', async (req, res) => {
  try{
    const id = req.params.id;
    const details = req.body;
    const title = details.title;
    const author = details.author;
    const review = details.review;
    const rating = details.rating;
    const date_read = details.date_read;

    db.query("UPDATE books SET title = $1 , author = $2 , rating = $3 , review = $4 , date_read = $5 WHERE id = $6",[title, author, rating, review, date_read, id]);
    res.redirect("/");
  }catch(error){
    console.error("Error updating book:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});