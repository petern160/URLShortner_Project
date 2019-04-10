var express = require("express");
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

  function generateRandomString() {
        return Math.random().toString(36).slice(2,8);
}

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

app.get("/", (req, res) => {
  res.send("warkajrwkla!");
});

app.get('/urls/new', function(req, res){
    res.render("urls_new");
     });

app.get('/urls', function(req, res){
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

  app.get('/u/:shortURL', function(req, res){
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });


app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
    var urlShort = req.params.name
    var short = urlDatabase[urlShort]
    });

app.post("/urls", (req, res) => {
    var random = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[random] = longURL;  
    res.redirect(`/urls/${random}`);
      });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});