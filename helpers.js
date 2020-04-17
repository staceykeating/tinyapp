const bcrypt = require('bcrypt');

const returnID = (email, users) => {
  let id;
  for (let user in users) {
    if (email === users[user].email) { //checking if the email entered matches a user in database email
      id = users[user].id;
      return id;                       //gives userID to be used to retrieve other info from database
    }
  }
  return false;
};

const getURLS = (userID) => { //goes through all URLS and returns to us only the URLs of the currently logged in user
  let urlsToDisplay = {};
  for (let urls in urlDatabase) {
    if (urlDatabase[urls].userID === userID) {
      urlsToDisplay[urls] = urlDatabase[urls];
    }
  }
  return urlsToDisplay;
};


const emailExists = (email) => { //check if email is in database
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};

const generateRandomString = function() { //for userID and tinyURL generating
  const tinyString = [...Array(6)].map(() => Math.random().toString(36)[2]).join("");
  return tinyString; //referenced: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
};

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "s2k38g" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "user1" }
};

const users = {
  "user1": {
    id: "user1",
    email: "user1@example.com",
    hashedPassword: bcrypt.hashSync("123", 10)
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("456", 10)
  }
};

module.exports = { returnID, getURLS, emailExists, generateRandomString, urlDatabase, users };