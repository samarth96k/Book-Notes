import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const port = 3000;
const app = express();
const db = new pg.Client({
    user : "postgres",
    password : "root",
    port : 5432,
    host : "localhost",
    database : "books"
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

db.connect();

let introduction = {
    owner_name : "Samarth Khandelwal",
    desc : `Hi there! I am Samarth Khandelwal. I hope you find these book notes a good place for learning or for getting the crux of the books that I have kept for myself. Maybe you might find something interesting and knowledgeable here.

My recommendations and reviews are purely based on my personal perspective, so do try to check out all the books yourself — you might have a different taste!

You can sort the following books using Ratings, Date Added, or Alphabetical Order. I keep updating these notes regularly, so feel free to explore and revisit anytime.

I created this space to store the ideas, lessons, and thoughts that stayed with me after reading. Hopefully, these summaries save your time, spark curiosity, or inspire you to pick up a new book.

Thank you for stopping by, and I hope you enjoy going through these notes as much as I enjoyed creating them. Happy reading!`
}

async function getBookNotes(){
    try{
        const result = await db.query("SELECT * FROM book_notes ORDER BY id;");
        // console.log(result.rows);
        return result.rows;
    }catch(err){
        console.log(err);
    }  
}

async function getBookDetails(){
    try{
        const result = await db.query("SELECT * FROM book_details ORDER BY id;");
        // console.log(result.rows);
        return result.rows;
    }catch(err){
        console.log(err);
    }  
} 

let booknotesdata  = await getBookNotes();
let bookdetailsdata = await getBookDetails();
app.get("/",async (req,res)=>{
    // console.log(booknotesdata);console.log(bookdetailsdata);
    res.render("index.ejs",{bookNotes : booknotesdata, bookDetails : bookdetailsdata, intro : introduction});
});

app.post("/submit_add_book_request",async (req,res)=>{
    let title = req.body.bookTitle;
    let author = req.body.bookAuthor;
    let notes = req.body.bookNotes;
    let rate = req.body.rate;
    let online_url = req.body.bookOnlineShoppingLink;
    let isbn = req.body.isbn;
    let olid = req.body.olid;
    let oclc = req.body.OCLC;
    let lccn = req.body.LCCN;
    let today = new Date().toISOString().split('T')[0];

    let key , value;

    if (isbn) {
        key = "id";
        value = isbn;
    } else if (olid) {
        key = "olid";
        value = olid;
    } else if (oclc) {
        key = "oclc";
        value = oclc;
    } else if (lccn) {
        key = "lccn";
        value = lccn;
    }
    
    let image_url =  `https://covers.openlibrary.org/b/${key}/${value}-M.jpg` //here image will come
   
    try{
        const result = await db.query("INSERT INTO book_notes(title,img_url,notes) VALUES($1,$2,$3) RETURNING *;",[title,image_url,notes]);
        let id = result.rows[0].id;
        console.log("hello");
        await db.query("INSERT INTO book_details VALUES($1,$2,$3,$4,$5);",[id,author,today,rate,online_url]);
    }catch(err){
        console.log(err);
    }
    res.redirect("/");
});

// SORT BY RATING (highest first)
app.get("/sort/rating", async (req, res) => {
  try {
    const bookDetails = await db.query(
      "SELECT * FROM book_details ORDER BY recommend DESC;"
    );

    const bookNotes = await db.query(`
      SELECT bn.*
      FROM book_notes bn
      JOIN book_details bd ON bn.id = bd.id
      ORDER BY bd.recommend DESC;
    `);
    booknotesdata = bookNotes.rows;
    bookdetailsdata = bookDetails.rows;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// SORT BY LATEST (using date_read column)
app.get("/sort/latest", async (req, res) => {
  try {
    const bookDetails = await db.query(
      "SELECT * FROM book_details ORDER BY date_read DESC;"
    );

    const bookNotes = await db.query(`
      SELECT bn.*
      FROM book_notes bn
      JOIN book_details bd ON bn.id = bd.id
      ORDER BY bd.date_read DESC;
    `);
    booknotesdata = bookNotes.rows;
    bookdetailsdata = bookDetails.rows;
    res.redirect("/");        
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// SORT BY TITLE (alphabetical A → Z)
app.get("/sort/title", async (req, res) => {
  try {
    const bookDetails = await db.query(`
      SELECT bd.*
      FROM book_details bd
      JOIN book_notes bn ON bd.id = bn.id
      ORDER BY TRIM(bn.title) ASC;
    `);

    const bookNotes = await db.query(`
      SELECT bn.*
      FROM book_notes bn
      JOIN book_details bd ON bn.id = bd.id
      ORDER BY TRIM(bn.title) ASC;
    `);
    booknotesdata = bookNotes.rows;
    bookdetailsdata = bookDetails.rows;
    res.redirect("/");           
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
});