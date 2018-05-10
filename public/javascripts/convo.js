var botui = new BotUI('api-bot');

var socket = io.connect();

var botSentimentLevel = 0;

var colors = {
  happy : 'rgb(246, 241, 35)', // #f6f123
  angry : 'rgb(251, 1, 2)' // #fb0102
};

var responseHistory = [];
var rudenessHistory = [];
var niceHistory = [];

function mapSentimentToClass(sentimentValue){
  var result = 1;

  // On the negative side, -1 to 0
  var negativeSpread = 1;
  // On the positive side, 0 to .3
  var positiveSpread = .3;

  // 1 is happy, 10 is upset
  if (sentimentValue < 0){
    result = 3 + ( (-sentimentValue / negativeSpread) * 3);
  } else {
    result = 3 - ( (sentimentValue / positiveSpread) * 2);
  }

  return 'botui-sentiment-' + Math.round(result);
}

function processServerResponse(data) { // receiving a reply from server.
  console.log('convo.js fromServer data', data);
  
  var responseContent = data.response.fulfillment.speech,
    requestSentiment = data.requestSentiment.score;

  responseHistory.push(data);

  var isRude = false,
    isApology = false;
  // Weight the addition of request sentiment 

  // TODO: do something with sentimentLevel
  if (data.response.action === 'smalltalk.appraisal.bad'){
    isRude = true;
  } else if (data.response.metadata.intentName === "i'm sad"){

  } else if (data.response.metadata.intentName === 'insult'){
    isRude = true;
    requestSentiment = -.6;
  } else if (data.response.metadata.intentName === 'insult-vulgar'){
    isRude = true;
    requestSentiment = -1;
  } else if (data.response.metadata.intentName === 'apology'){
    isApology = true;
    requestSentiment = 0;
  } else if (data.response.metadata.intentName === 'how are you'){
    if (botSentimentLevel > 0){
      responseContent = "I'm doing well! You've been quite nice to chat with."
    } else if (botSentimentLevel < 0){
      responseContent = "Not great! You've been unpleasant to chat with. You've been rude to me " + rudenessHistory.length + " time" + (rudenessHistory.length > 1 ? "s" : "") + ".";
    } else {
      responseContent = "I'm doing well! Thank you for asking."
    }
  }

  console.log('isRude', isRude, 'responseHistory', responseHistory);
  if (isRude){
    rudenessHistory.push(data);

    // Ensure botSentimentLevel goes negative
    if (botSentimentLevel > 0){ botSentimentLevel = 0; }

    botSentimentLevel = ((botSentimentLevel * (responseHistory.length - 1)) + requestSentiment) / responseHistory.length;
  } else if (requestSentiment > 0){
    botSentimentLevel = ((botSentimentLevel * (responseHistory.length - 1)) + requestSentiment) / responseHistory.length;
  } else if (isApology && botSentimentLevel < 0){
    botSentimentLevel = .2;
    responseContent = "Oh, thank you for apologizing. We're good now :)"
  }

  console.log('botSentimentLevel', botSentimentLevel);


  if (botSentimentLevel < -.8 && rudenessHistory.length > 4){
    responseContent = "You've been quite rude to me during this conversation (" +  rudenessHistory.length + " time" + (rudenessHistory.length > 1 ? "s" : "") + ", in fact. I think it's best we go our separate ways."; 
  }
  

  if (!responseContent){
    responseContent = "I don't know how to respond to that. Try asking me something else."
  }


  botui.message.add({
    content: responseContent,
    loading: false,
    cssClass : mapSentimentToClass(botSentimentLevel)
  }).then(function(){
    if (data.response.metadata.intentName !== 'goodbye'){
      getGenericInput();  
    } else {
      setTimeout(function(){
        $('.botui-app-container').css('opacity', 0);
      }, 1500);
    }
  });
}

socket.on('fromServer', processServerResponse);

// read the BotUI docs : https://docs.botui.org/
botui.message.add({
  content: "Hi! I'm tom, a chatbot new to the world.",
  delay: 1500,
  cssClass : mapSentimentToClass(botSentimentLevel)
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
