var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var request=require('request');

mongoose.connect('mongodb://localhost/CurrencyTracker');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();

var cron = require('node-cron');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

//Login UserName show
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});
// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

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

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});



app.use('/', routes);
app.use('/users', users);

//cron
// //6 star for running task every second and 5 star for running task every minutes
cron.schedule('*/20 * * * * *', function(){
  console.log('running a task every minute');
});

//Get TokenCode 
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
MongoClient.connect(url, function(err, db) {
 if (err) throw err;
 var dbo = db.db("CurrencyTracker");
 var array=[];
  //var tokendata;
 dbo.collection("tokens").find({},{_id :0,tokencode:1}).toArray(function(err, result) {
   if (err) throw err; 
        for(var i=0;i<result.length;i++)
         {          
           array[i]=result[i].tokencode;
          //console.log(tokencodes);
         }        
       console.log(array.length)
        array.forEach(element => {          
        console.log(element);      
        });
        //Get Api request
        request('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,ETH,LTC,USD,EUR', (err, res, body) => {
          if (err) { return console.log(err); }
          var token=JSON.parse(body);
            console.log(token.ETH);
            //console.log(body.explanation);
           });
    db.close();
 });
});

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

