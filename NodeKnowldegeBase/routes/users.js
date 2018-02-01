const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Import Models
let UserModel = require('../models/user');

//Register Form
router.get('/register', (req, res)=>{
  res.render('register');
});

//Registration Process
router.post('/register', (req, res)=>{
  //Assign request values to corresponding variables
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  //Validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      title: 'Register',
      errors: errors
    });
  } else{
    let newUser = new UserModel({
      name: name,
      email: email,
      username: username,
      password: password
    });

    //Generate Salt (salt= random data)
    //and hash the password
    bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(newUser.password, salt, (err, hash)=>{
        if(err){
          console.log('Hash error: ' +err);
        }
        //Assign hash value to password
        newUser.password = hash;

        //Save newUser to database
        newUser.save((err)=>{
          if(err){
            consol.log('new user save error: ' + err);
            return;
          } else{
            //Message to user
            req.flash('success', 'You are now registered');
            res.redirect('/users/login');
          }
        });//end newUser
      });//end bcrypt hash
    });//end bcrypt genSalt
  }
});//end post

//Login Form
router.get('/login', (req, res)=>{
  res.render('login');
});

//Login Process
router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Logout
router.get('/logout', (req, res)=>{
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
