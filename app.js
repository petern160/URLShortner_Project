var express = require("express");
var app = express();

var PORT = 8080; // default port 8080


app.set("view engine", "ejs");


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
    let templateVars = { shortURL: req.params.shortURL, longURL: req.params.shortURL };
    });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});