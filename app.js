const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

var PORT = 8080; // default port 8080


app.set("view engine", "ejs");


  // generates random alphanumeric with length of 6
  function generateRandomString() {
        return Math.random().toString(36).slice(2,8);
}

//global objects for accessing data
var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

  const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }
    app.get("/", (req, res) => {
    res.send("warkajrwkla!");
    });
    //
    app.get('/urls/new', function(req, res){
      let templateVars = { 
        urls: urlDatabase,
        username: req.cookies.username,
       };
        res.render("urls_new", templateVars);
        });


    app.get('/urls', function(req, res){
     
        let templateVars = { 
          urls: urlDatabase,
          username: req.cookies.username,
         };

        res.render("urls_index", templateVars);
    });

    app.get('/u/:shortURL', function(req, res){
        const longURL = urlDatabase[req.params.shortURL];
        res.redirect(longURL);
    });
    
    //:shortURL sets parameter on our local host such as /urls/b2xVn2
    app.get("/urls/:shortURL", (req, res) => {
        let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
        res.render("urls_show", templateVars);
        var urlShort = req.params.name
        var short = urlDatabase[urlShort]
        });

        // gets cookie information and saves it in the developer tools
        app.post('/login', (req, res) => {
          res.cookie('username', req.body.username);
          res.redirect('/urls');
        })

        // clears cookie when logout
        app.post('/logout', (req, res) => {
          let templateVars = {
            username: undefined,
          };
          
          res.clearCookie('username');
          res.redirect('/urls')
        });
        
        //delete functionality
    app.post("/urls/:shortURL/delete", (req, res) => {
        const shortURL = req.params.shortURL;
        delete urlDatabase[shortURL];
        res.redirect('/urls');
    });
    
    //update functionality
    app.post("/urls/:id/update", (req, res) => {
        const id = req.params.id;
        const update = req.body.longURL;
        urlDatabase[id] = update;
        res.redirect('/urls');

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