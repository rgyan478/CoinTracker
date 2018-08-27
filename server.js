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
var mongoose = require('mongoose');    
var config=require('./models/config');         
var MongoClient = require('mongodb').MongoClient;
mongoose.connect(config.ServerConnectionURL);

//server connection
//mongoose.connect('mongodb://rgyan:rgyan123@ds245901.mlab.com:45901/currencytracker');
//mongoose.connect('mongodb://localhost:27017/crypto_moon_tracker');
var db = mongoose.connection;
var routes = require('./routes/index');
var users = require('./routes/users');
var Token = require('./models/token');
var Utility = require('./models/utility');
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
  
  //  Create an Predefiend array of CurrencyList
  res.locals.currencylistarray=["BTC","ETH","LTC","USDT","BNB","USD","CAD","EUR","GBP","AUD","JPY","CNY","KRW","VND"]; 

  next();
});
app.use('/', routes);
app.use('/users', users); 
//cron
// //6 star for running task every second and 5 star for running task every minutes
var cron = require('node-cron');
 //Start Cron-Every 20 sECOND
cron.schedule('*/15 * * * * *', function(){
  console.log('Update currency value every 20 second.');
 
//Server connection Url "ServerConnectionURL"
//Local connection Url "LocalConnectionURL"
var conditionQuery;
var newValues;
MongoClient.connect(config.ServerConnectionURL, { useNewUrlParser: true } , function(err, db) {
 if (err) throw err;
 var dbo = db.db("CurrencyTracker");
 var array=[]; 
 dbo.collection("tokens").find({},{_id :0,tokencode:1}).toArray(function(err, result) 
 {
  // console.log("total",result);
    if (err) throw err;   
      
    //loop for get unique value from array
    for(var i=0;i<=result.length;i++)
    {
    for(var j=i+1;j<=result.length;j++)
      {
        if(result[i]==result[j])
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

      var CurrencyValues;
      
      //Get max value
      var tokenmax=element.max;
      var tokenmin=element.min;
      var priviousColor=element.colorclass;
      var currency=element.currency;
      //console.log('PreviousColor:'+priviousColor);
      Utility.getCurrentPriceByAPI(element.tokencode,config.CurrencyApiCode, function(currentValues){        
        for(var currencyItem in currentValues)
        {       
          if(currency !=currencyItem)
            continue;

          //console.log("cureencycode",currencyItem);
          //console.log("tokencode",element.tokencode);
          conditionQuery = {_id: element._id, tokencode: element.tokencode, currency:currencyItem};
          //Get Color 
          var currentPrice=currentValues[currencyItem];
          var color=Utility.getColor(tokenmin, tokenmax, currentPrice) 
         // console.log("colorname",color);
          if(priviousColor == 'green')
          {
            //console.log('Color:'+ color +' Min:' + tokenmin +' Max: '+tokenmax +' Current Price: '+currentPrice);
            tokenmax=currentPrice;
            //console.log('PreviousColor:'+priviousColor);
            
          }
          else if(priviousColor == 'red')
          {
            //console.log('Color:'+ color +' Min:' + tokenmin +' Max: '+tokenmax +' Current Price: '+currentPrice);
            tokenmin=currentPrice;
            //console.log('PreviousColor:'+priviousColor);
            
          }
          //console.log(color);       
          newValues = { $set: { currentvalue:currentPrice, lastvalue:element.currentvalue, min:tokenmin, max:tokenmax, colorclass:color}}; 

          Token.updateToken(conditionQuery, newValues, function(err, res) {
            if (err) throw err;

            if(res.nModified == 1)
            {
              //console.log(res);
            //  console.log('Color:'+ color +' Min:' + tokenmin +' Max: '+tokenmax +' Current Price: '+currentPrice);
            }
    
          });
        
        } 
      });
     
    });       
    
    db.close();
 });
});//End Connection
});//End Cron
// Set Port
app.set('port', (process.env.PORT || 8080));
app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
