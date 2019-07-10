const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser')
app.use(cookieParser())

const randomID = (length) => {  
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const users = {
  "testuserid" : {
    id: 123,
    email: "testuser@test.com",
    password: "password123"
  }
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase , 
    "users": users, user_id: request.cookies.user_id};
  response.render("urls_index", templateVars);
});

app.get("/login", (request, response) => {
  let templateVars = { urls: urlDatabase , 
    "users": users, user_id: request.cookies.user_id};
 response.render("login", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = { urls: urlDatabase , 
    users: users, user_id: request.cookies.user_id};
    if (!request.cookies.user_id) {
      response.redirect("/urls");
    }
  response.render("urls_new", templateVars);
});

app.get("/registration", (request, response) => {
  let templateVars = { urls: urlDatabase , 
    users: users, user_id: request.cookies.user_id};
  response.render("registration", templateVars);  
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console

  let newShortURL = randomID(6);
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/registration", (request, response) => {
  let newRandomID = randomID(10);
  for (const key in users) {
    if (users[key].email === request.body.email){
      response.send("can't use that email");
      return;
    }
  }
    users[newRandomID] = {};
    users[newRandomID].id = newRandomID;
    users[newRandomID].email = request.body.email;
    users[newRandomID].password = request.body.password;
    response.redirect("/urls");
});

app.post("/login", (request, response) => {
  for (const key in users) {
    if (users[key].email === request.body.email && users[key].password === request.body.password) {
      response.cookie('user_id', key);
      response.redirect("/urls");
      return;
    } 
  }
  response.status(403).send("Invalid email or password");
});
  
app.post("/urls/:shortURL/delete", (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect('/urls');
});

app.post("/urls/:shortURL/update", (request, response) => {
  
  response.redirect(`/urls/` + request.params.shortURL);
});

app.post("/urls/:shortURL/newLong", (request, response) => {
  urlDatabase[request.params.shortURL] = request.body.newurl;
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  request.cookies.user_id.verified = true;
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect("/urls");
});

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id, longURL: urlDatabase[request.params.id], users: users, user_id: request.cookies.user_id};
  response.render("urls_show", templateVars);
});

app.get("/u/:firstParam", (req, res) => {
  const longURL = urlDatabase[req.params.firstParam];
  res.redirect(longURL);
});