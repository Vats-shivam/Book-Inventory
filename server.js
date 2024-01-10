const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'shivam',
  password: 'shivam',
  database: 'kindle_book_review',
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Middleware to parse JSON requests
app.use(express.json());

// 1. Retrieve the list of all books in the inventory along with their authors' names
app.get('/books', (req, res) => {
  const query = `
    SELECT books.id, books.title, authors.author_name, books.published_year, books.quantity_available
    FROM books
    INNER JOIN authors ON books.author_id = authors.author_id;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  });
});

// 2. Add a new book to the inventory
app.post('/books', (req, res) => {
  const { title, authorId, publishedYear, quantityAvailable } = req.body;

  // Check if the author exists
  const checkAuthorQuery = `SELECT 1 FROM authors WHERE author_id = ?`;

  connection.query(checkAuthorQuery, [authorId], (err, results) => {
    if (err) {
      console.error('Error checking author:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      // Author does not exist, send an error response
      return res.status(400).json({ message: 'Author does not exist', error: 'Please add the author first' });
    } else {
      console.log("Author exist");
      // Author exists, add the book
      const addBookQuery = `
        INSERT INTO books (title, author_id, published_year, quantity_available)
        VALUES (?, ?, ?, ?)
      `;

      connection.query(
        addBookQuery,
        [title, authorId, publishedYear, quantityAvailable],
        (err, results) => {
          if (err) {
            console.error('Error adding book:', err);
            res.status(500).send('Internal Server Error');
          } else {
            res.status(201).json({ message: 'Book added successfully' });
          }
        }
      );
    }
  });
});

// 3. Update the quantity available for a specific book
app.put('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const newQuantity = req.body.newQuantity;

  const updateQuantityQuery = `UPDATE books SET quantity_available = ? WHERE id = ?`;

  connection.query(updateQuantityQuery, [newQuantity, bookId], (err, results) => {
    if (err) {
      console.error('Error updating quantity:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json({ message: 'Quantity updated successfully' });
    }
  });
});

// 4. Delete a book from the inventory based on its ID
app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;

  const deleteBookQuery = `DELETE FROM books WHERE id = ?`;

  connection.query(deleteBookQuery, [bookId], (err, results) => {
    if (err) {
      console.error('Error deleting book:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json({ message: 'Book deleted successfully' });
    }
  });
});

app.post('/authors', (req, res) => {
  const { authorId, authorName, authorBio } = req.body;

  const addAuthorQuery = `
    INSERT INTO authors (author_id, author_name, author_bio)
    VALUES (?, ?, ?)
  `;

  connection.query(
    addAuthorQuery,
    [authorId, authorName, authorBio],
    (err, results) => {
      if (err) {
        console.error('Error adding author:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(201).json({ message: 'Author added successfully' });
      }
    }
  );
});


// Close MySQL connection on application exit
process.on('exit', () => {
  connection.end();
  console.log('MySQL connection closed');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
