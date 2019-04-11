const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");


// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

var PORT = 8080; // default port 8080


app.set("view engine", "ejs");


  // generates random alphanumeric with length of 6
  function generateRandomString() {
        return Math.random().toString(36).slice(2,8);
}

var newCookie = generateRandomString();

// checks if password and emails match
function passwordCheck(pass, email) {
  for (let key in users) {
   if(emailExist(email)){
     if(users[key].password === pass){
       return true;
     }
   }
  }return false
}

// checks duplicate email
function emailExist(email) {
  for (let key in users) {
    if (users[key]['email'] === email) {
      return users[key];
    }
  }
  return false;
}

// function for cookies and id
function getUserId(email){
  for (let key in users) {
    if (users[key]['email'] === email) {
      return users[key].id;
    }
  }
  return false;
}

function urlsForUser(id) {
  let result = {};
   for(var key in urlDatabase){
     if (urlDatabase[key].userID === id){
     result[key] = urlDatabase[key];
     }
   }
   return result;
  }

// function returns URLS where userID is equal to the id of currently logged users


//global objects for accessing data
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  jih76f: { longURL: "https://www.reddit.com", userID: "user2RandomID" }
};

  //can use this object for test cases login password match etc
  var users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "test@gmail.com", 
      password: "123"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "1234"
    }
  }

    //register page
    app.get("/register", (req, res) => {
      let templateVars = { 
        users: users,
       };
    res.render("emailpw", templateVars);
    });
    

    // /urls/new page with
    app.get('/urls/new', function(req, res){
      let templateVars = { 
      
        user: users[req.cookies['user_id']],
        users: users
      
       };
       if(req.cookies['user_id']){
         
         res.render('urls_new', templateVars)
       }else{
         res.redirect('/login')
       }
        // res.render("urls_new", templateVars);
        });

        //
        app.get('/login', function(req, res){
          let templateVars = { 
            urls: urlDatabase,
            user: users[req.cookies['user_id']]
           };
            res.render("login", templateVars);
            });

    app.get('/urls', function(req, res){
     
        let templateVars = { 
          urls: urlsForUser(req.cookies['user_id']),
          user: users[req.cookies['user_id']]
          
         };
      
         
        res.render("urls_index", templateVars);
    });

    app.get('/u/:shortURL', function(req, res){
        const longURL = urlDatabase[req.params.shortURL];
        res.redirect(longURL);
    });

    // adds random id, email, and password to the users object
    app.post("/register", (req, res) => {
      // error handles empty string and duplicate emails
      if(!req.body.email || !req.body.password || emailExist(req.body.email)) {
        res.sendStatus(400)
        return;
      }
      
      const idRand = generateRandomString()
      var add = {
        id: idRand,
        email: req.body.email,
        password: req.body.password
      }

      users[idRand] = add
      res.cookie('user_id', idRand);
      
      res.redirect('/urls')


    
      // if(add[password][req.body.password] && add[email][req.body.email] == ""){
        

      //   res.redirect('/urls')
      // }else{
      //   res.sendStatus(400);
      // }
      // console.log(users)
     
    
      });


    //:shortURL sets parameter on our local host such as /urls/b2xVn2
    app.get("/urls/:shortURL", (req, res) => {
        let templateVars = { 
          shortURL: req.params.shortURL,
          longURL: urlDatabase[req.params.shortURL],
          urls: urlsForUser(req.cookies['user_id'])
          };

          // if user trys to access :shortURL redirect to login
          if(!req.cookies['user_id']){
            res.redirect("/login")
          }else{
            res.render("urls_show", templateVars);
          }
       
        var urlShort = req.params.name
        var short = urlDatabase[urlShort]
        });

        // gets cookie information and saves it in the developer tools
        app.post('/login', (req, res) => {
          
          let email = req.body.email;
          let pass = req.body.password;
          //console.log('req body', req.body)
          if(!emailExist(email)){
            res.status(403).send("Status Code 403: Email address does not exist! Please Register")
          }

          if(!passwordCheck(pass, email)){
            res.status(403).send("Status Code 403: password does not match!")
          }
         
          
            res.cookie('user_id', getUserId(email));
            res.redirect('/urls');
           
           
          
        })

        // clears cookie when logout
        app.post('/logout', (req, res) => {
          let templateVars = {
            username: undefined,
          };
          
          res.clearCookie('user_id');
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
        //console.log(req) 
        const id = req.params.id;
        const update = req.body.longURL;
        if(update) {
        urlDatabase[id].longURL = update; 
        console.log("update", urlDatabase)
        }
        res.redirect('/urls');

    });
    
    // generates URL
    app.post("/urls", (req, res) => {
        var random = generateRandomString();
        var longURL = req.body.longURL;
        urlDatabase[random] = {longURL: longURL, userID: req.cookies.user_id };  
        console.log("test",urlDatabase);
        res.redirect(`/urls/${random}`);
    });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});