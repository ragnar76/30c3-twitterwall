var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);


var twitter = require('ntwitter');
var express = require('express');

if ( process.argv.length < 7 ) {
  console.log("usage: node server.js [consumer_key] [consumer_secret] [access_token_key] [access_token_secret] [track]");
  process.exit(1);
}

var twit = new twitter({
    consumer_key        : process.argv[2],
    consumer_secret     : process.argv[3],
    access_token_key    : process.argv[4],
    access_token_secret : process.argv[5]
});

var track = process.argv[6];

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
  twit.search(track.split(',').join(' OR '), {}, function(err, data) {
    for(var tweet in data.statuses) {
      socket.emit('tweet', { data: data.statuses[tweet] });
    }
    console.log(err);
  });
  twit.stream('statuses/filter', {'track': track }, function(stream) {
    //twit.stream('statuses/sample', function(stream) {
    stream.on('data', function (data) {
      socket.emit('tweet', { data: data });
      console.log(data);
    });
  });
});

server.listen(3000);
