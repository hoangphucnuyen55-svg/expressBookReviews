const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists in our users list
  const userExists = users.some(user => user.username === username);

  if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    
    let bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  const findBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  findBookByISBN
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});
  
  // Check if the book exists in our books database object
  if (books[isbn]) {
      return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  
  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve) => {
        const keys = Object.keys(books);
        let matchingBooks = [];
        keys.forEach(key => {
          if (books[key].author.toLowerCase() === authorParam) {
              matchingBooks.push({ isbn: key, ...books[key] });
          }
        });
        resolve(matchingBooks);
      });
    };

    let matched = await getBooksByAuthor();
    if (matched.length > 0) {
      return res.status(200).send(JSON.stringify(matched, null, 4));
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  const getBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let matchingBooks = [];
    keys.forEach(key => {
      if (books[key].title.toLowerCase() === titleParam) {
          matchingBooks.push({ isbn: key, ...books[key] });
      }
    });
    
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found with this title");
    }
  });

  getBooksByTitle
    .then((matched) => {
      return res.status(200).send(JSON.stringify(matched, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if the book exists and has reviews
  if (books[isbn]) {
      return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
