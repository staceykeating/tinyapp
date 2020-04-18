//****************************************************************************************************************\\
//  App created by Stacey Keating at Lighthouse Labs, April 2020                                                  \\
//  Use npm install to install all dependancies                                                                   \\
//  Use npm start to run server                                                                                   \\
//  View readme for more information                                                                              \\
//****************************************************************************************************************\\

const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { returnID, getURLS, emailExists, generateRandomString, urlDatabase, users } = require("./helpers");
const cookieSession = require("cookie-session");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["lknt42fnoh90hn2hf90w8fhofnwe0"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


app.set("view engine", "ejs");

////MAIN PAGE\\\\\
app.get("/", (req, res) => {
  const userID  = req.session.user_id; //storing userID from cookie
  const loggedinUser = users[userID];

  if (loggedinUser !== undefined) {
    (res.redirect("/urls"));          //only redirects to main page if user is logged in
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const loggedinUser = users[userID];
  const urlsToDisplay = getURLS(userID); //function checks database for URLS with matching userID

  if (loggedinUser !== undefined) {
    let templateVars = { userID: req.session.user_id, email: req.session.email, urls: urlsToDisplay }; //displays URLS of user
    res.render("urls_index", templateVars);
  } else {
    errorMessage = "Please log in to view.";
    res.redirect("/error");
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

////MAKE A NEW URL\\\\
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const loggedinUser = users[userID];

  if (loggedinUser !== undefined) {
    let templateVars = { userID: req.session.user_id, email: req.session.email, urls: urlDatabase };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

////REGISTRATION STUFF\\\\
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const loggedinUser = users[userID];

  if (loggedinUser === undefined) {
    let templateVars = { userID: req.session.user_id, email: req.session.email, urls: urlDatabase };
    res.render("urls_registration", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/registerdirect", (req, res) => {
  res.redirect("/register");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let email = req.body.email;

  if (emailExists(email) === true) {        //checks if email is already in database
    errorMessage = "Email already in use.";
    res.redirect("/error");
  } else if (email.length === 0 || password.length === 0) { //makes sure no empty fields
    errorMessage = "Please fill out all fields.";
    res.redirect("/error");
  }
  users[id] = { id, email, hashedPassword };
  email = req.body.email;
  req.session.user_id = id;
  req.session.email = email;
  res.redirect("/urls");
});

////SHORTURL PAGE\\\\

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL); //when shortURL is clicked it will take you to the website that corresponds
});


app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const loggedinUser = users[userID];
  const shortURL = req.params.shortURL;

  
  if (loggedinUser !== undefined) {
    let urlsToDisplay = getURLS(userID);
    if (!urlsToDisplay[shortURL]) {
      errorMessage = "User has not defined this URL.";
      res.redirect("/error");
    } else {
      let templateVars = {   userID: req.session.user_id, email: req.session.email, shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL};
      res.render("urls_show", templateVars);
    }
  } else {
    errorMessage = "Please log in to view.";
    res.redirect("/error");
  }
});

////SHORTURL EDITING & DELETING\\\\
app.get("/urls/:shortURL/delete", (req, res) => { //only accessible by logged in users
  const userID = req.session.user_id;
  const loggedinUser = users[userID];
  const shortURL = req.params.shortURL;

  if (loggedinUser !== undefined) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send(400, "Please log in");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id }; //updates longURL when new address entered
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/editfromindex", (req, res) => { //leads to edit page
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => { //deletes item from urls page and refreshes page
  const userID = req.session.user_id;
  const loggedinUser = users[userID];
 
  if (loggedinUser !== undefined) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send(400, "Please log in");
  }
});



////LOG IN AND LOG OUT\\\\
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const loggedinUser = users[userID];

  if (loggedinUser === undefined) {
    let templateVars = { userID: req.session.user_id, email: req.session.email, urls: urlDatabase };
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/logindirect", (req, res) => {
  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.session = null; //delete cookies on logout
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const userID = returnID(email, users);
  const password = req.body.password;
  if (emailExists(email) === false) {
    errorMessage = "Email or password incorrect"; //email exists checks if email is in database
    res.redirect("/error");
  } else if (emailExists(email) === true) {
    const hashedPassword = users[userID].hashedPassword;
    if (!bcrypt.compareSync(password, hashedPassword)) { //password verification failure
      errorMessage = "Email or password incorrect";
      res.redirect("/error");
    } else if (bcrypt.compareSync(password, hashedPassword)) { //password verifaction pass
      req.session.user_id = userID;
      req.session.email = email;
      res.redirect("/urls");
    }
  }
});

////ERROR PAGE\\\\
app.get("/error", (req, res) => {
  let templateVars = { userID: req.session.user_id, email: req.session.email, error: errorMessage};
  res.render("urls_error", templateVars);
});

////RUN PROGRAM\\\\
app.listen(PORT, () => {
  console.log(`We're here live on port ${PORT}!!!! `);
});
////THANK-YOU FOR VISITING 😃😃😃\\\\