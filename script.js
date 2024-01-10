document.addEventListener('DOMContentLoaded', () => {
  // Fetch and display the list of books on page load
  fetchBooks();

  // Handle form submission for adding a new book
  document.getElementById('addBookForm').addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
  });
  // document.getElementById('addAuthorForm').addEventListener('submit', (event) => {
  //   event.preventDefault();
  //   addAuthor();
  // });
});

function fetchBooks() {
  // Fetch the list of books from the server and display them
  fetch('http://localhost:3000/books')
    .then(response => response.json())
    .then(data => displayBooks(data))
    .catch(error => console.error('Error fetching books:', error));
}

function displayBooks(books) {
  const booksContainer = document.getElementById('books-container');
  booksContainer.innerHTML = '';

  books.forEach(book => {
    const bookElement = document.createElement('div');
    bookElement.innerHTML = `
      <p><strong>Title:</strong> ${book.title}</p>
      <p><strong>Author:</strong> ${book.author_name}</p>
      <p><strong>Published Year:</strong> ${book.published_year}</p>
      <p><strong>Quantity Available:</strong> ${book.quantity_available}</p>
      <button onclick="updateQuantity(${book.id})">Update Quantity</button>
      <button onclick="deleteBook(${book.id})">Delete Book</button>
      <hr>
    `;
    booksContainer.appendChild(bookElement);
  });
}

function addAuthor(title, authorId, publishedYear, quantityAvailable) {
  document.getElementById('add-author-form').style.display = 'block';
  document.getElementById('addAuthorForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const authorBio = document.getElementById('authorBio').value;
    const authorName = document.getElementById('authorName').value;
    console.log({ title, authorId, publishedYear, quantityAvailable, authorName, authorBio });
    fetch('http://localhost:3000/authors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authorBio, authorId, authorName }),
    }).then(response => response.json())
      .then(data => {
        console.log(data);

      })
    fetch('http://localhost:3000/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, authorId, publishedYear, quantityAvailable }),
    })
      .then(response => response.json())
      .then(data => {
        fetchBooks(); // Refresh the book list after adding a new book
      })
      .catch(error => console.error('Error adding book:', error));

  })
  // console.log(bookData);
}

function addBook() {
  const title = document.getElementById('title').value;
  const authorId = document.getElementById('authorId').value;
  const publishedYear = document.getElementById('publishedYear').value;
  const quantityAvailable = document.getElementById('quantityAvailable').value;
  fetch('http://localhost:3000/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, authorId, publishedYear, quantityAvailable }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        addAuthor(title, authorId, publishedYear, quantityAvailable);
      }
      fetchBooks(); // Refresh the book list after adding a new book
    })
    .catch(error => console.error('Error adding book:', error));
}

function updateQuantity(bookId) {
  const newQuantity = prompt('Enter the new quantity:');
  if (newQuantity !== null) {
    fetch(`http://localhost:3000/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newQuantity }),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchBooks(); // Refresh the book list after updating quantity
      })
      .catch(error => console.error('Error updating quantity:', error));
  }
}

function deleteBook(bookId) {
  if (confirm('Are you sure you want to delete this book?')) {
    fetch(`http://localhost:3000/books/${bookId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchBooks(); // Refresh the book list after deleting a book
      })
      .catch(error => console.error('Error deleting book:', error));
  }
}
