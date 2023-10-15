const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  // Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getBooks().then((booksData) => {
    res.send(JSON.stringify(booksData, null, 4));
  })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  getBookByIsbn(isbn).then((book) => {
    if (book) {
      res.send(book);
    } else {
      res.status(404).send('Book not found');
    }
  })
    .catch((error) => {
      res.status(500).send('Error: ' + error.message);
    });
});

function getBookByIsbn(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error('Book not found'));
    }
  });
}


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  findBooksByAuthor(req.params.author)
    .then((books) => {
      if (books.length === 0) {
        res.status(404).json({ message: "Author not found" });
      } else {
        res.json(books);
      }
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

function findBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const foundBooks = [];
    for (const [key, values] of Object.entries(books)) {
      const book = Object.entries(values);
      for (let i = 0; i < book.length; i++) {
        if (book[i][0] === 'author' && book[i][1] === author) {
          foundBooks.push(books[key]);
        }
      }
    }
    if (foundBooks.length === 0) {
      reject(new Error("Author not found"));
    } else {
      resolve(foundBooks);
    }
  });
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  findBooksByTitle(req.params.title)
    .then((books) => {
      if (books.length === 0) {
        res.status(404).json({ message: "Title not found" });
      } else {
        res.json(books);
      }
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

function findBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const foundBooks = [];
    for (const [key, values] of Object.entries(books)) {
      const book = Object.entries(values);
      for (let i = 0; i < book.length; i++) {
        if (book[i][0] === 'title' && book[i][1] === title) {
          foundBooks.push(books[key]);
        }
      }
    }
    if (foundBooks.length === 0) {
      reject(new Error("Title not found"));
    } else {
      resolve(foundBooks);
    }
  });
}

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
