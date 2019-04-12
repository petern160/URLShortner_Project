const express = require('express')
const app = express()
var cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieSession({
  name: 'session',
  secret: 'test'
}))

var PORT = 8080 // default port 8080
app.set('view engine', 'ejs')

// generates random alphanumeric with length of 6
function generateRandomString () {
  return Math.random().toString(36).slice(2, 8)
}

// checks if password and emails match
function passwordCheck (pass, email) {
  for (let key in users) {
    if (emailExist(email)) {
      if (users[key].password === pass) {
        return true
      }
    }
  } return false
}

// check if id matches and if shortURL matches so you cannot delete
function checkUserID (id, shortURL) {
  return (urlDatabase[shortURL].userID === id)
}

// checks duplicate email
function emailExist (email) {
  for (let key in users) {
    if (users[key]['email'] === email) {
      return users[key]
    }
  }
  return false
}

// function for cookies and id
function getUserId (email) {
  for (let key in users) {
    if (users[key]['email'] === email) {
      return users[key].id
    }
  }
  return false
}

// function returns URLS where userID is equal to the id of currently logged users
function urlsForUser (id) {
  let result = {}
  for (var key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key]
    }
  }
  return result
}

// database object for testing and adding in new data
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'user2RandomID' },
  jih76f: { longURL: 'https://www.reddit.com', userID: 'user2RandomID' }
}

// can use this object for test cases login password match etc
var users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'test@gmail.com',
    password: '123'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: '1234'
  }
}

// home page that redirects depending if logged in or not
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
})

// register page
app.get('/register', (req, res) => {
  let templateVars = {
    users: users
  }

  res.render('emailpw', templateVars)
})

// page with new urls can only be accessed with login
app.get('/urls/new', function (req, res) {
  let templateVars = {

    user: users[req.session.user_id],
    users: users

  }
  if (req.session.user_id) {
    res.render('urls_new', templateVars)
  } else {
    res.redirect('/login')
  }
})

// login page
app.get('/login', function (req, res) {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  }
  res.render('login', templateVars)
})

// urls page has to be logined or else you will asked to register or login
app.get('/urls', function (req, res) {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]

  }
  if (req.session.user_id) {
    res.render('urls_index', templateVars)
    res.redirect('/urls')
  } else {
    res.render('registerError', templateVars)
  }
})
// shortURL is has to contain https:// or http:// then go to the website example https://www.google.ca else you get an error
app.get('/u/:shortURL', function (req, res) {
  const longURL = urlDatabase[req.params.shortURL].longURL

  if (longURL.includes('https://') || (longURL.includes('http://'))) {
    res.redirect(longURL)
  } else {
    res.render('invalidURL')
  }
})

// adds random id, email, and password to the users object
app.post('/register', (req, res) => {
  // error handles empty string and duplicate emails
  if (!req.body.email || !req.body.password || emailExist(req.body.email)) {
    res.render('invalidField')
    return
  }

  // alphanumeric const assigned to our id
  const idRand = generateRandomString()

  var add = {
    id: idRand,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }

  console.log(add)
  users[idRand] = add
  req.session.user_id = add.id

  res.redirect('/urls')
})

// :shortURL sets parameter on our local host such as /urls/b2xVn2
app.get('/urls/:shortURL', (req, res) => {
  const foundURL = urlDatabase[req.params.shortURL]

  // if user trys to access :shortURL without being logged in make them register or login
  if (!req.session.user_id) {
    res.render('registerError')
  } else {
    if (!foundURL) {
      res.render('registerError')
      return
    }

    if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
      res.render('registerError')
    } else {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: foundURL.longURL,
        urls: urlsForUser(req.session.user_id)
      }
      // show url
      res.render('urls_show', templateVars)
    }
  }
})

// gets cookie information and saves it in the developer tools
app.post('/login', (req, res) => {
  let email = req.body.email
  let pass = req.body.password

  if (!emailExist(email)) {
    res.status(403).send('Status Code 403: Email address does not exist! Please Register')
  }

  if (!passwordCheck(pass, email)) {
    res.status(403).send('Status Code 403: password does not match!')
  }

  req.session.user_id = getUserId(email)
  res.redirect('/urls')
})

// clears cookie when logout
app.post('/logout', (req, res) => {
  res.clearCookie('session')
  res.redirect('/urls')
})

// delete functionality redirects user if they try to delete url if the id does not match
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id
  const shortURL = req.params.shortURL

  if (userID) {
    if (checkUserID(userID, shortURL)) {
      delete urlDatabase[shortURL]
      res.redirect('/urls')
    } else {
      res.send('YOU DO NOT HAVE PERMISSION TO DELETE')
    }
  } else {
    res.send('YOU DO NOT HAVE PERMISSION TO DELETE')
  }
})

// update functionality that updates the shortURL to the website you want
app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id
  const update = req.body.longURL
  if (update) {
    urlDatabase[id].longURL = update
  }
  res.redirect('/urls')
})

// generates URL with alphanumeric string
app.post('/urls', (req, res) => {
  var random = generateRandomString()
  var longURL = req.body.longURL
  urlDatabase[random] = { longURL: longURL, userID: req.session.user_id }
  res.redirect(`/urls/${random}`)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})
