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
var request=require('request');
var player = require('play-sound')();


//mongoose.connect('mongodb://localhost/CurrencyTracker');
mongoose.connect('mongodb://rgyan:rgyan123@ds245901.mlab.com:45901/currencytracker');
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
 
  
  //  Create an Predefiend array of CurrencyList
  res.locals.currencylistarray=["USD","BIT","EUR","ETH","LTC","BTC","ZRX","AEON","ADX","ADT","ARN","AE","AIX","AST","BEE","BBT","BNB","IOT","HT","ENJ","EOS"]; 

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
  
//Get TokenCode 

//play sound.....
// player.play('./sound/mps.mp3', function(err){
//   if (err) throw err
//   console.log("Audio finished");
// })

var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/";
var url = "mongodb://rgyan:rgyan123@ds245901.mlab.com:45901/currencytracker";
var data;
var conditionQuery;
var newValues;

MongoClient.connect(url, { useNewUrlParser: true } , function(err, db) {
 if (err) throw err;
 var dbo = db.db("currencytracker");
 var array=[]; 
 dbo.collection("tokens").find({},{_id :0,tokencode:1}).toArray(function(err, result) 
 {
   
    if (err) throw err;   
    
    // for(var i=0;i<result.length;i++)
    // {       
    //  console.log(result[i].currentvalue);
    
    // }    
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
      //console.log("color",result.colorclass);
      //Get max value
      var tokenmax=element.max;
     
      request('https://min-api.cryptocompare.com/data/price?fsym=' + element.tokencode + '&tsyms=USD,EUR,YEE,PRE,ZRX,AEON,AIDOC,ADX,ADT,ADST,ARN,AE,AIX,BIT,ICN,KIN,KNC,LBC,LSK,LTC,LUN,MCO,DGB,IFT,VTC,VRC',
          { json: true }, 
          (err, res, body) => 
          {
            if (err) { return console.log(err); }
            var token = JSON.stringify(body);
            CurrencyValues = JSON.parse(token);          
            for(var currencyItem in CurrencyValues)
            {       
              console.log("total max:", CurrencyValues[currencyItem]);   
              var green="green";
              var red="red";
              var black="black";
              //console.log("chekc",CurrencyValues[currencyItem])
                conditionQuery = {_id: element._id, tokencode: element.tokencode, currency:currencyItem};
               if(tokenmax < CurrencyValues[currencyItem] )
               {
                newValues = { $set: { currentvalue:CurrencyValues[currencyItem],lastvalue:element.currentvalue,colorclass:green  }}; 
               }  
              else if(tokenmax > CurrencyValues[currencyItem]  )    
              {
               
                newValues = { $set: { currentvalue: CurrencyValues[currencyItem],lastvalue:element.currentvalue,colorclass:red  }};           
              }
                  
            else 
             {
              console.log("test111111");
               newValues = { $set: { currentvalue: CurrencyValues[currencyItem],lastvalue:element.currentvalue,colorclass:black  }};           
             }
              Token.updateToken(conditionQuery, newValues, function(err, res) {
                if (err) throw err;
               // console.log("Currency  updated");
        
              });
           
            }                 
          
          }); 
    });       
    
    db.close();
 });
});//End Connection
});//End Cron
// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+ app.get('port'));
});

