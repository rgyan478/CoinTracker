var MongoClient = require('mongodb').MongoClient,assert = require('assert');
// Connection URL
//var url = 'mongodb://localhost:27017/CurrencyTracker';
var url = 'mongodb://rgyan:rgyan123@ds245901.mlab.com:45901/currencytracker';
// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true } , function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.close();
});
 module.exports=MongoClient;