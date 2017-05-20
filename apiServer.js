var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var logger = require('morgan');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// APIs
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/bookshop');

var Books = require('./models/books.js');

var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));

//---------->>> SET UP SESSIONS <<<------------
app.use(session({
  secret: 'mySecretString',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({mongooseConnection: db, ttl: 2 * 24 * 60 * 60})
}))

// SAVE SESSION CART API
app.post('/cart', function(req, res){
  var cart = req.body;
  req.session.cart = cart;
  req.session.save(function(err){
    if(err){
      throw err;
    }
    res.json(req.session.cart);
  })
})
//GET SESSION CART API
app.get('/cart', function(req, res){
  if(typeof req.session.cart !== 'undefined') {
    res.json(req.session.cart);
  }
})

////---------->>> END SESSIONS SET UP <<<------------

//---------->>> POST BOOKS <<<------------

app.post('/books', function(req, res){
  var book = req.body;

  Books.create(book, function(err, books){
    if(err){
      throw err;
    }
    res.json(books);
  })
});

//---------->>> GET BOOKS <<<------------

  app.get('/books', function(req, res){
  Books.find(function(err, books){
    if(err){
      throw err;
    }
    res.json(books);
  })
});

//---------->>> DELETE BOOKS <<<------------

  app.delete('/books/:_id', function(req, res){
    var query = {_id: req.params._id}
  Books.remove(query, function(err, books){
    if(err){
      throw err;
    }
    res.json(books);
  })
});



// END Apis

app.listen(3001, function(err){
  if(err){
    return console.log(err);
  }
  console.log('API Server is listening on http://localhost:3001');
})
