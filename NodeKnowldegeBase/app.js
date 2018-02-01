//Require express module instance
const express = require('express');
//Set path module instance
const path = require('path');
//Require Body parser
const bodyParser = require('body-parser');
//Require Express Validator
const expressValidator = require('express-validator');
const connectFlash = require('connect-flash');
const session = require('express-session');
//Require Mongoose
const mongoose = require('mongoose');
const passport = require('passport');
//Require database configuration files
const config = require('./config/database');

//Connect to database
//mongoose.connect('mongodb://localhost/nodekb');
mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once('open', ()=>{
  console.log('Connected to MongoDB');
});

//Check for DB errors
db.on('error', (err)=>{
  console.log('Error with db connection '+err);
});

//Initialise applicaiton
const app = express();

//Import Models
let ArticleModel = require('./models/article');
let UserModel = require('./models/user');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Set Public Folder
//folder that contains static files e.g. css files
app.use(express.static(path.join(__dirname, 'public')));

/*******Middleware Section********/
//Body-Parser Middleware (parse application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Express Session Middleware (Messages)
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);//set global variable 'messages' to the express messages
  next();
});

//Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var   namespace = param.split('.'),
            root      = namespace.shift(),
            formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Passport config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Enable Global user variable
app.get('*', (req, res, next)=>{
  res.locals.user = req.user || null;
  next();
});

//Home Route
app.get('/', (req, res)=>{
  //retrieving articles from db
  ArticleModel.find({}, (err, articles)=>{
    if(err){
      console.log(err);
    }
    else{
      //render index view
      res.render('index', {
        title:'Articles',
        articles: articles
      });
    }

  });
});

//Route files (require articles.js from router file)
let articles = require('./routes/articles');
//(require users.js from router file)
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

//Start Server
app.listen(8080, ()=>{
  console.log('Server started on port 8080');
});
