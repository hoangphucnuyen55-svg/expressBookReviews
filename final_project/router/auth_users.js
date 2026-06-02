const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  // Returns true if the username is unique (not already taken)
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  return userswithsamename.length === 0;
}

const authenticatedUser = (username,password)=>{ 
  // Returns true if username and password match an existing record
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  return validusers.length > 0;
}

//only registered users can login
reg_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(282).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
reg_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let filtered_book = books[isbn];
  
  if (filtered_book) {
      let review = req.query.review;
      let reviewer = req.session.authorization['username'];
      if(review) {
          filtered_book['reviews'][reviewer] = review;
          books[isbn] = filtered_book;
      }
      return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  } else {
      return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
