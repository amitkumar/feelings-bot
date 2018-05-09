
class Emotion {
	
	constructor(level) {
		this.level = level || 0;
		this.history = [];
		// History : list of objects, props: reason, message, messageSentiment, details
  	}

  	addMessageEvent(event){

  	}
}

Emotion.REASONS = {
	NO_THANK_YOU : 'NO_THANK_YOU',
	RUDE_MESSAGE : 'RUDE_MESSAGE',
};

module.exports = Emotion;