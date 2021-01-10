var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts: [
    'http://192.168.1.36:9200/',
  ]
});

module.exports = client;  