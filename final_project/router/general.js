const express = require('express');
const axios = require('axios'); // Ensure Axios is imported
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);

  if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// BASE ROUTE FOR AXIOS INTERNAL CALLS
public_users.get('/local-books', (req, res) => {
  return res.status(200).json(books);
});

// Task 10: Get the book list available in the shop using Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/local-books');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch book list via Axios" });
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get('http://localhost:5000/local-books')
    .then((response) => {
      const bookList = response.data;
      if (bookList[isbn]) {
        return res.status(200).send(JSON.stringify(bookList[isbn], null, 4));
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "Error fetching book details" });
    });
});
  
// Task 12: Get book details based on author using Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  
  try {
    const response = await axios.get('http://localhost:5000/local-books');
    const bookList = response.data;
    const keys = Object.keys(bookList);
    let matchingBooks = [];

    keys.forEach(key => {
      if (bookList[key].author.toLowerCase() === authorParam) {
          matchingBooks.push({ isbn: key, ...bookList[key] });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Task 13: Get all books based on title using Promise callbacks with Axios
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  axios.get('http://localhost:5000/local-books')
    .then((response) => {
      const bookList = response.data;
      const keys = Object.keys(bookList);
      let matchingBooks = [];

      keys.forEach(key => {
        if (bookList[key].title.toLowerCase() === titleParam) {
            matchingBooks.push({ isbn: key, ...bookList[key] });
        }
      });
      
      if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
      } else {
        return res.status(404).json({ message: "No books found with this title" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "Error fetching books by title" });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
      return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
