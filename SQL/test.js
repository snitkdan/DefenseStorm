var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
    userName: 'INFO445',
    password: 'GoHuskies!',
    server: 'IS-HAY04.ischool.uw.edu',
    options: {
      database:'dstorm'
    }
};
var connection = new Connection(config);
connection.on('connect', function(err) {
    if(err){
      console.log(err);
    }
    else {
      console.log('Connected');
      insertIntoFact();
    }
});

function queryCUSTOMER_BUILD(){
  request = new Request('USE CUSTOMER_BUILD SELECT TOP 10 * FROM [dbo].[tblCUSTOMER];', function(err){
  if(err){
    console.log(err);}
  });

  var result = '';
  request.on('row', function(columns){
    columns.forEach(function(column){
      if(column.value === null){
        console.log('NULL');
      }
      else {
        result += column.value + ' ';
      }
    });
    console.log(result);
    result = '';
  });

  request.on('done', function(rowCount, more){
    console.log(rowCount + ' rows returned');
  });
  connection.execSql(request);

}

function insertIntoFact() {
  request = new Request('INSERT INTO [dbo].FACT (FactName, FactValue) VALUES (@FactName, @FactValue)', function(err){
    if(err){
      console.log(err);}
  });

  request.addParameter('FactName', TYPES.VarChar, 'Fact 1');
  request.addParameter('FactValue', TYPES.VarChar, 'This is Fact 1! Enjoy');

  request.on('row', function(columns){
    columns.forEach(function(column){
      if(column.value === null){
        console.log('NULL');
      }
      else {
          console.log('FactID of inserted item is ' + column.value);
      }
    });
  });
  connection.execSql(request);
}
