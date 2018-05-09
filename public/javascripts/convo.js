var botui = new BotUI('api-bot');

var socket = io.connect('http://localhost:8010');

var sentimentLevel = 1;

function processServerResponse(data) { // receiving a reply from server.
  console.log('convo.js fromServer data', data);
  
  sentimentLevel
  botui.message.add({
    content: data.response.fulfillment.speech,
    delay: 500,
  }).then(getGenericInput);

}

socket.on('fromServer', processServerResponse);

// read the BotUI docs : https://docs.botui.org/
botui.message.add({
  content: 'Hi! I\'m selfbot.',
  delay: 1500,
}).then(function () {
  
  botui.action.text({
    action: { 
      placeholder: 'Say Hello!'
    }
  })
  .then(function (res) {
      socket.emit('fromClient', { client : res.value }); // sends the message typed to server
      console.log('convo.js fromclient res.value', res.value); // will print whatever was typed in the field.
  });

});


function getGenericInput(){
  botui.action.text({
    action: { 
      placeholder: ''
    }
  })
  .then(function (res) {
  
      socket.emit('fromClient', { 
        client : res.value,
        parameters : {
          sentimentLevel : 1
        }
      }); // sends the message typed to server
      console.log('convo.js fromclient res.value', res.value); // will print whatever was typed in the field.
  })
}
