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
var Token = require('./models/token');
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
var cron = require('node-cron');
 //Start Cron-Every 20 sECOND
cron.schedule('*/20 * * * * *', function(){
  console.log('Update currency value every 20 second.');

//Get TokenCode 

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var data;
var conditionQuery;
var newValues;

MongoClient.connect(url, function(err, db) {
 if (err) throw err;
 var dbo = db.db("CurrencyTracker");
 var array=[]; 
 dbo.collection("tokens").find({},{_id :0,tokencode:1}).toArray(function(err, result) 
 {
    if (err) throw err; 
   // console.log(result.currentvalue);
    for(var i=0;i<result.length;i++)
    {          
      array[i]=result[i].tokencode;
    //  console.log(result[i].currentvalue);
    }    
    //loop for get unique value from array
    for(var i=0;i<result.length;i++)
    {
      for(var j=i+1;j<result.length;j++)
      {
        if(result[i].tokencode==result[j].tokencode)
        {
            delete result[j];
        }
        else
        {
              continue;
        }
      }
    }

    result.forEach(element => {    

    //  console.log(element.tokencode);   
     // console.log('-------------');   
      var CurrencyValues;
      request('https://min-api.cryptocompare.com/data/price?fsym=' + element.tokencode + '&tsyms=USD,EUR,YEE,PRE,ZRX,AEON,AIDOC,ADX,ADT,ADST,ARN,AE,AIX,BIT,ICN,KIN,KNC,LBC,LSK,LTC,LUN,MCO,DGB,IFT,VTC,VRC',
          { json: true }, 
          (err, res, body) => 
          {
            if (err) { return console.log(err); }
            var token = JSON.stringify(body);
            CurrencyValues = JSON.parse(token);
           // console.log(element.tokencode);  
            for(var currencyItem in CurrencyValues)
            {            
               // console.log("key:"+currencyItem+", value:"+CurrencyValues[currencyItem]);
                 conditionQuery = {_id: element._id, tokencode: element.tokencode, currency: currencyItem};
                 newValues = { $set: { currentvalue: CurrencyValues[currencyItem],lastvalue:element.currentvalue  }};           
               
              Token.updateToken(conditionQuery, newValues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
              //  console.log(res);
              });
             // console.log(conditionQuery);
             // console.log(newValues);
             // console.log('-------code for------');   
            
            }                 
          
          }); 
    });       
    
    db.close();
 });
});
});//End Cron
// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

