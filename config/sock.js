// var app = require('express')();
var sharedSession = require("express-socket.io-session");
const gLanguage = require('@google-cloud/language');
// Instantiates a client
const language = new gLanguage.LanguageServiceClient({
  keyFilename: './FeelingsBot-e8f92c28ffe7.json'
});

var emotion = new require('../lib/emotion');
var api = require('./api');

// var server = require('http').Server(app);
var io;


var start = function() {
  io.on('connection', function (socket) {
    socket.handshake.session.selfSentimentLevel = 1;
    socket.handshake.session.save();
    console.log('sock.js socket.handshake.session', socket.handshake.session);

    socket.on('fromClient', function (data) {
      console.log('sock.js data.client', data.client);

      // Detects the sentiment of the text
      language
        .analyzeSentiment({
          document : { 
            content: data.client,
            type: 'PLAIN_TEXT'
          },
          features : { 
            extractSyntax : false,
            extractEntities : true,
            extractDocumentSentiment : true,
            extractEntitySentiment : true,
            classifyText : true
          }
        }) 
        .then(results => {
          const sentiment = results[0].documentSentiment;

          // console.log(`Text: ${text}`);
          console.log(`Sentiment score: ${JSON.stringify(sentiment, null, 4)}`);

          api.getRes(data.client).then(function(res){
          
            console.log('sock.js fromserver', JSON.stringify(res, null, 4));
              
            socket.emit('fromServer', { 
                response: res,
                requestSentiment : sentiment,
                selfSentimentLevel : socket.handshake.session.selfSentimentLevel
              });
           });
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    });

  });
}

module.exports = function(server, session){
  io = require('socket.io').listen(server);

  // Use shared session middleware for socket.io
  // setting autoSave:true
  io.use(sharedSession(session, {
      autoSave:true
  })); 

  return {start};
}
