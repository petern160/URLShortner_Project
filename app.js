var express = require("express");
var app = express();

var PORT = 8080; // default port 8080


app.set("view engine", "ejs");

var dogs = {
    spot: {
      name: 'Spot',
      breed: 'Chihuahua'
    },
    jujube: {
      name: 'Jujube',
      breed: 'Chiweenie'
    }
  }

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

app.get("/", (req, res) => {
  res.send("warkajrwkla!");
});

app.get('/urls', function(req, res){
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });


app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
    var urlShort = req.params.name
    var short = urlDatabase[urlShort]
    });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});