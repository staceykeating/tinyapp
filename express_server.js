const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const { returnID } = require('./helpers');
const cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['lknt42fnoh90hn2hf90w8fhofnwe0'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
/////LITTLE GUIDE BOX WITH COMMENTS ON HOW TO START AND STUFF//// 
//CREATED/PUBLISHED DATE///
app.set("view engine", "ejs");

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
}

//TESTING STUFF:
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const  user_id  = req.session.user_id
  let loggedinUser = users[user_id]
  let toDisplayURLS = getURLS(user_id)

  if (loggedinUser !== undefined) {
  let templateVars = { user_id: req.session.user_id, email: req.session.email, urls: toDisplayURLS };
  res.render("urls_index", templateVars);
}
  else (res.redirect("/login"))
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//MAKE A NEW URL
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id
  let loggedinUser = users[user_id]
  
  if (loggedinUser !== undefined) {
    let templateVars = { user_id: req.session.user_id, email: req.session.email, urls: urlDatabase };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//REGISTRATION STUFF
app.get("/register", (req, res) => {
  let templateVars = { user_id: req.session.user_id, email: req.session.email, urls: urlDatabase };
  res.render("urls_registration", templateVars);
});

app.post("/registerdirect", (req, res) => {
res.redirect("/register")
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  let email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(users);

  if (emailExists(email) === true) {
    res.send(400, "Email already in use")
  } else if (email.length === 0 || password.length === 0) {
    res.send(400, "Empty Field")
  }  
  users[id] = { id, email, hashedPassword }
  email = req.body.email;
  req.session.user_id = id;
  req.session.email = email;

  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});   

// URLS/PAGES
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id } 
  console.log(urlDatabase) // => shorlUrl : 'string'
  res.redirect(`/urls/${shortURL}`)           // => shortIrl : {longUrL, UserID}
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  let templateVars = {   user_id: req.session.user_id, email: req.session.email, 
  shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL};
  res.render("urls_show", templateVars);
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id }
  res.redirect(`/urls/${shortURL}`);
});   

app.post("/urls/:shortURL/editfromindex", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL]
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});   

app.post("/urls/:shortURL/delete", (req, res) => {
  const { user_id } = req.session.user_id
  let loggedinUser = users[user_id]
  let toDisplayURLS = getURLS(user_id)
 
  if (loggedinUser !== undefined) {
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls");
  } else {
    res.send(400, "Please log in"); 
  }
});

app.get("/urls/:shortURL/delete", (req, res) => {
  res.redirect("/urls");
});

//LOG IN AND LOG OUT
app.post("/logindirect", (req, res) => {
  res.redirect("/login");
});   

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});   

app.get("/login", (req, res) => {
  let templateVars = { user_id: req.session.user_id, email: req.session.email, urls: urlDatabase };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const userID = returnID(email, users)
  const password = req.body.password;

// needs to see if the emailExists, if it does it needs to cookie the email
  if (emailExists(email) === false) {
    res.send(403, "Email not in use, please register.")
  } else if (emailExists(email) === true) {
    const hashedPassword = users[userID].hashedPassword
  if (!bcrypt.compareSync(password, hashedPassword)) {// returns true  
    res.send(403, "Password incorrect")
  } else if (bcrypt.compareSync(password, hashedPassword)) {
    req.session.user_id = userID
    req.session.email = email
    res.redirect("/urls");
  }
}
});


app.listen(PORT, () => {
  console.log(`We're here live on port ${PORT}!!!! `);
});

const getURLS = (userID) => {
  let urlsToDisplay = {};
  for (let urls in urlDatabase) {
    if (urlDatabase[urls].userID === userID) {
      urlsToDisplay[urls] = urlDatabase[urls]
    }
  }
  return urlsToDisplay;
};


function emailExists(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return true
    }
  }
  return false;
};
// function returnID (email, users) {
//   let id;
//     for (let user in users) {
//       if (email === users[user].email) {
//         id = users[user].id
//           return id;
//       }
//     }
//     return false;
//   };

function generateRandomString() {
    const tinyString = [...Array(6)].map(() => Math.random().toString(36)[2]).join("")
    return tinyString;
//referenced: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 }
 //console.log(generateRandomString());
 

 console.log(`bc crypt test:`, (bcrypt.compareSync('123', '123')));