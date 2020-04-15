const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())


app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/registration", (req, res) => {
  res.render("urls_registration");
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;  
  res.redirect(`/urls/${shortURL}`)  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});   

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


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {   username: req.cookies["username"],
  shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
    res.redirect("/urls");
})

app.post("/login", (req, res) => {
res.cookie("username", req.body.username)

console.log(req.body.username)
   res.redirect(`/urls`);
 });   
 
 app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username)
  
  console.log(req.body.username)
     res.redirect(`/urls`);
   });   



app.listen(PORT, () => {
  console.log(`We're here live on port ${PORT}!!!! `);
});

function generateRandomString() {
    const tinyString = [...Array(6)].map(() => Math.random().toString(36)[2]).join('')
    return tinyString;
//referenced: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 }
 //console.log(generateRandomString());
 
