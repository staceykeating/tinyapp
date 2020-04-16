const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser")
app.use(cookieParser())


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "user1", 
    email: "user1@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2", 
    email: "user2@example.com", 
    password: "456"
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
  let templateVars = { user_id: req.cookies["user_id"], email: req.cookies["email"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//app.get("/urls.json", (req, res) => {
//  res.json(urlDatabase);
//});

//MAKE A NEW URL
app.get("/urls/new", (req, res) => {
  const { user_id } = req.cookies;
  console.log(user_id);
  let loggedinUser = users[user_id]
  
  if (loggedinUser !== undefined) {
    let templateVars = { user_id: req.cookies["user_id"], email: req.cookies["email"], urls: urlDatabase };
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// const { username } = req.cookies;
// const loggedInUser = users[username];

// if (loggedInUser) {
//   const templateVars = {
//     user: loggedInUser
//   }
//   res.render("treasure", templateVars);
// } else {
//   res.redirect('/');
//}
//REGISTRATION STUFF
app.get("/register", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], email: req.cookies["email"], urls: urlDatabase };
  res.render("urls_registration", templateVars);
});

app.post("/registerdirect", (req, res) => {
res.redirect("/register")
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (emailExists(email) === true) {
    res.send(400, "Email already in use")
  }
  else if (email.length === 0 || password.length === 0) {
    res.send(400, "Empty Field")
  }  
  // else if (users[email]){
  //   res.send(400, "Email already in use")
  // }
  users[id] = { id, email, password }
  res.cookie("user_id", id)
  res.cookie("email", email)
  res.redirect("/urls")
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});   

// URLS/PAGES
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;  
  res.redirect(`/urls/${shortURL}`)  
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {   user_id: req.cookies["user_id"], email: req.cookies["email"], 
  shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});   

app.post("/urls/:shortURL/editfromindex", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL]
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});   

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
    res.redirect("/urls");
})

//LOG IN AND LOG OUT
app.post("/logindirect", (req, res) => {
  //console.log(req.body.user_id)
  res.redirect("/login");
 });   
 app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id)
  res.redirect("/urls");
});   

app.get("/login", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], email: req.cookies["email"], urls: urlDatabase };
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = returnID(email)
  // needs to see if the emailExists, if it does it needs to cookie the email
  if (emailExists(email) === false) {
    res.send(403, "Email not in use, please register.")
  }
  else if (emailExists(email) === true && users[id].password !== password) {
    //console.log("Matched");
    res.send(403, "Password incorrect")
  }
  else if (emailExists(email) === true && users[id].password === password) {
    //console.log("Matched");
    res.cookie("email", email)
    res.cookie("user_id", id)
    res.redirect("/urls");
  }
  //users[id] = { email, password }

  //console.log(users);

})


app.listen(PORT, () => {
  console.log(`We're here live on port ${PORT}!!!! `);
});

function emailExists(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return true
    }
  }
  return false;
};
function returnID (email) {
  let id;
    for (let user in users) {
      if (email === users[user].email) {
        id = users[user].id
          return id;
      }
    }
    return false;
  };

function generateRandomString() {
    const tinyString = [...Array(6)].map(() => Math.random().toString(36)[2]).join("")
    return tinyString;
//referenced: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 }
 //console.log(generateRandomString());
 
