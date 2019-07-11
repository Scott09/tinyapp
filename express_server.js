const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const getUserByEmail = require('./helpers');

app.set('trust proxy', 1)


// var cookieParser = require('cookie-parser');
// app.use(cookieParser());


app.use(cookieSession({
  name: "session",
  keys: ['key1', 'key2']
}));




const randomID = (length) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {

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
  let templateVars = {
    urls: urlDatabase,
    "users": users, user_id: request.session.user_id
  };
  if (!request.session.user_id) {
    response.redirect("/login");
    return;
  }
  response.render("urls_index", templateVars);
});

app.get("/login", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    "users": users, user_id: request.session.user_id
  };
  response.render("login", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    users: users, user_id: request.session.user_id
  };
  if (!request.session.user_id) {
    response.redirect("/urls");
  }
  response.render("urls_new", templateVars);
});

app.get("/registration", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    users: users, user_id: request.session.user_id
  };
  response.render("registration", templateVars);
});

app.post("/urls", (request, response) => {
  // console.log(req.body);  // Log the POST request body to the console

  let newShortURL = randomID(6);
  urlDatabase[newShortURL] = {};
  urlDatabase[newShortURL].longURL = request.body.longURL;
  urlDatabase[newShortURL].userID = request.session.user_id;
  response.redirect("/urls");
});

app.post("/registration", (request, response) => {
  let newRandomID = randomID(10);
  
    if (getUserByEmail(request.body.email, users) !== false) {
      response.send("can't use that email");
      return;
  }
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[newRandomID] = {};
  users[newRandomID].id = newRandomID;
  users[newRandomID].email = request.body.email;
  users[newRandomID].password = hashedPassword;
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  for (const key in users) {
    if (users[key].email === request.body.email && bcrypt.compareSync(request.body.password ,users[key].password)) {
      request.session.user_id = key;
      
      response.redirect("/urls");
      return;
    }
  }

  response.status(403).send("Invalid email or password");
  response.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (request, response) => {
    if (urlDatabase[request.params.shortURL].userID === request.session.user_id) {
      delete urlDatabase[request.params.shortURL];
      response.redirect('/urls');
    } else {
      response.send("You may only delete urls created by you!")
    }
  }
);

app.post("/urls/:shortURL/update", (request, response) => {
  response.redirect(`/urls/` + request.params.shortURL);
});

app.post("/urls/:shortURL/newLong", (request, response) => {
  urlDatabase[request.params.shortURL].longURL = request.body.newurl;
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/urls");
});

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id, longURL: urlDatabase[request.params.id].longURL, users: users, user_id: request.session.user_id };
  response.render("urls_show", templateVars);
});

app.get("/u/:firstParam", (req, res) => {
  if (urlDatabase[req.params.firstParam]) {
    const longURL = urlDatabase[req.params.firstParam].longURL;
    res.redirect(longURL);
  }
});
