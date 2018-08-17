var request=require('request');

module.exports.getColor = function(min, max, current){
<<<<<<< HEAD
    if(parseFloat(max) < parseFloat(current))
        return 'green';
=======
  console.log("current" + current,"min" + min,"max" + max)
    if(parseFloat(max) < parseFloat(current))  
        return 'green';      
>>>>>>> c0ae3e86f31d7b487686aa0aafc819445feaf92a
    else if(parseFloat(min) > parseFloat(current))
       return 'red';
    else
        return 'black';
}

// Get Current price of the token from API
//currencyList should be in comma seprate if more than one. like 'USD,BTN'
module.exports.getCurrentPriceByAPI = function(token, currencyList, callback){
    var CurrencyValues;
    request(
        'https://min-api.cryptocompare.com/data/price?fsym=' + token + '&tsyms='+currencyList,
        { json: true }, 
        (err, res, body) => 
        {
        if (err) { return console.log(err); }
        var token = JSON.stringify(body);
        CurrencyValues = JSON.parse(token);  
        //callback function for doing the next things after getting CurrencyValues     
        callback(CurrencyValues);   
        });
}
