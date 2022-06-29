const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const LocalStrategy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')
const User = require('./models/user')
const bcrypt = require('bcrypt')

const DB =
  'mongodb+srv://auth1:gEYtTSCqghwmNL16@cluster0.vjh35.mongodb.net/auth_demo_app?retryWrites=true&w=majority'

mongoose
  .connect(DB)
  .then(() => {
    console.log('connection successful')
  })
  .catch((err) => {
    console.log(err)
  })

const PORT = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

app.use(
  require('express-session')({
    secret: 'Mary had a little lamb',
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', function (req, res) {
  res.render('welcome')
})

app.get('/dashboard', isLoggedIn, function (req, res) {
  res.render('dashboard')
})

app.get('/mgprof', isLoggedIn, function (req, res) {
  res.render('mgprof')
})

app.get('/register', function (req, res) {
  res.render('register')
})

app.post('/register', function (req, res) {
  req.body.username
  req.body.password
  User.register(
    new User({
      username: req.body.username,
    }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err)
        return res.render('register')
      }
      passport.authenticate('local')(req, res, function () {
        res.redirect('mgprof')
      })
    }
  )
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/mgprof',
    failureRedirect: '/login',
  }),
  function (req, res) {
    console.log(res)
  }
)

app.post('/update', async (req, res) => {
  const newName = req.body.username
  const newPassword = req.body.password
  const name = req.user.username
  const user1 = await User.findOneAndUpdate(
    { username: name },
    { username: newName }
  )
  User.findOne({ username: name }).then((u) => {
    u.setPassword(newPassword, (err, u) => {
      if (err) return console.log(err)
      u.save()
      res.status(200).json({ message: 'password change successful' })
    })
  })
  res.redirect('logout')
})

app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/login')
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

app.listen(PORT, function () {
  console.log('server started')
})
