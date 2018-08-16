var express = require('express');
    path = require('path');
    cookieParser = require('cookie-parser');
    bodyParser = require('body-parser');
    exphbs = require('express-handlebars');
    expressValidator = require('express-validator');
    flash = require('connect-flash');
    session = require('express-session');
    passport = require('passport');
    LocalStrategy = require('passport-local').Strategy;
    mongoose = require('mongoose');    
    config=require('./models/config');         
    MongoClient = require('mongodb').MongoClient;
    routes = require('./routes/index');
    users = require('./routes/users');
    Token = require('./models/token');
    Utility = require('./models/utility');
    app = express();// Init App
    cron = require('node-cron');
    mongoose.connect(config.ConnectionURL);  
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
//Start Cron-Every 20 sECOND
cron.schedule('*/15 * * * * *', function(){
console.log('Update currency value every 20 second.'); 
var conditionQuery;
var newValues;
 MongoClient.connect(config.ConnectionURL, { useNewUrlParser: true } , function(err, db) {
 if (err) throw err;
 var dbo = db.db("currencytracker");
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
      //Get max value
      var tokenmax=element.max;
          tokenmin=element.min;
          priviousColor=element.colorclass;
          currency=element.currency;    
          Utility.getCurrentPriceByAPI(element.tokencode,config.CurrencyApiCode, function(currentValues){        
        for(var currencyItem in currentValues)
        {       
          if(currency !=currencyItem)
            continue;         
          conditionQuery = {_id: element._id, tokencode: element.tokencode, currency:currencyItem};
          //Get Color 
          var currentPrice=currentValues[currencyItem];
          var color=Utility.getColor(tokenmin, tokenmax, currentPrice)       
          if(priviousColor == 'green')
          {           
            tokenmax=currentPrice;                      
          }
          else if(priviousColor == 'red')
          {          
            tokenmin=currentPrice;        
            
          }                
          newValues = { $set: { currentvalue:currentPrice, lastvalue:element.currentvalue, min:tokenmin, max:tokenmax, colorclass:color}};
          Token.updateToken(conditionQuery, newValues, function(err, res) {
            if (err) throw err;
            console.log("Update !")
           
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


