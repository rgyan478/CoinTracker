var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');    
var config=require('./models/config');         
var MongoClient = require('mongodb').MongoClient;
var routes = require('./routes/index');
var users = require('./routes/users');
var Token = require('./models/token');
var Utility = require('./models/utility');
var cron = require('node-cron');

//Connection 
mongoose.connect(config.ServerConnectionURL);

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

//Route
app.use('/', routes);
app.use('/users', users); 

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;  
  res.locals.currencylistarray=["BTC","ETH","LTC","USDT","BNB","USD","CAD","EUR","GBP","AUD","JPY","CNY","KRW","VND"]; 
  next();
});
//Start Cron-Every 20 sECOND
cron.schedule('*/20 * * * * *', function()
{
    console.log('Update currency value every 20 second.');
    var conditionQuery;
    var newValues;
    MongoClient.connect(config.ServerConnectionURL, { useNewUrlParser: true } , function(err, db) {
    if (err) throw err;
    var dbo = db.db("currencytracker");
    var array=[]; 
    dbo.collection("tokens").find({},{_id :0,tokencode:1}).toArray(function(err, result) 
    {  
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
          Utility.getCurrentPriceByAPI(element.tokencode,config.CurrencyApiCode, function(currentValues){        
            for(var currencyItem in currentValues)
            {       
              if(currency !=currencyItem)
                continue;         
              conditionQuery = {_id: element._id, tokencode: element.tokencode, currency:currencyItem};
              //Get Color 
              var currentPrice=currentValues[currencyItem];
              var color=Utility.getColor(tokenmin, tokenmax, currentPrice);        
              if(priviousColor=='green' && color =='green')
              {           
                tokenmax=currentPrice;         
                
              }
              else if(priviousColor == 'red' && color =='red')
              {            
                tokenmin=currentPrice;          
                
              }
              else if(priviousColor=='black' && color =='black')
              {
              
                tokenmax=element.max;
                tokenmin=element.min;
              }
              newValues = { $set: { currentvalue:currentPrice, lastvalue:element.currentvalue, min:tokenmin, max:tokenmax, colorclass:color}}; 

              Token.updateToken(conditionQuery, newValues, function(err, res) {
                if (err) throw err;

                if(res.nModified == 1)
                {
                
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
