/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
var https = require('https');
var axios = require("axios").default;
var stringSimilarity = require("string-similarity");

const quizGenerator = (topic) => {
    axios.post('https://38c4-73-170-38-15.ngrok.io/generate-quiz', { topic: topic });
}

const fetchQuiz = async () => {
  try {
    const { data } = await axios.get("https://38c4-73-170-38-15.ngrok.io/get-quiz");
    return data;
  } catch (error) {
    console.error('cannot fetch quiz', error);
  }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, you can ask me to create a quiz for you or to give you a quiz that\'s ready.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/*const AnswerHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        let answer = slots['answer'].value;
        let speech = '';
        let score = sessionAttributes.score;
        if (sessionAttributes.options[sessionAttributes.index][answer-1] === sessionAttributes.answers[sessionAttributes.index]) {
            let speeches = [
                'Yippee! That\'s correct. Would you like to continue?',
                'You\'re insane!, That\'s right, keep going! Would you like to continue?',
                'Voila! you\'re correct. Would you like to continue?',
                'BINGO! that\'s correct! Would you like to continue?'
                ]
            speech = speeches[Math.floor(Math.random() * speeches.length)];
            sessionAttributes.score =  score + 1;
        }
        else {
            let speeches = [`OOPS! wrong answer. The correct answer was: ${sessionAttributes.answers[sessionAttributes.index]}. Would you like to continue?`, `Sorry, that's not the correct answer. The correct answer was: ${sessionAttributes.answers[sessionAttributes.index]}. Would you like to continue?`]
            speech = speeches[Math.floor(Math.random() * speeches.length)];
            sessionAttributes.score =  score - 1;
        }
        sessionAttributes.index += 1;
        return handlerInput.responseBuilder
            // .speak(`${answer === sessionAttributes.answer} ${typeof(answer)} ${typeof(sessionAttributes.answer)} answer: ${answer} actual answer: ${sessionAttributes.answer}`)
            .speak(`${answer}`)
            .getResponse();
    }
};*/


const AnswerHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        let answer = slots['answer'].value;
        let speech = '';
        let score = sessionAttributes.score;
        
        var similarity = stringSimilarity.compareTwoStrings(answer, sessionAttributes.answers[sessionAttributes.index]);
        
        if(similarity >= 0.75){
            let speeches = [
                'Yippee! That\'s correct. Would you like to continue?',
                'You\'re insane!, That\'s right, keep going! Would you like to continue?',
                'Voila! you\'re correct. Would you like to continue?',
                'BINGO! that\'s correct! Would you like to continue?'
                ]
            speech = speeches[Math.floor(Math.random() * speeches.length)];
            sessionAttributes.score =  score + 1;
        }
        else{
            let speeches = [`OOPS! wrong answer. The correct answer was: ${sessionAttributes.answers[sessionAttributes.index]}. Would you like to continue?`, `Sorry, that's not the correct answer. The correct answer was: ${sessionAttributes.answers[sessionAttributes.index]}. Would you like to continue?`]
            speech = speeches[Math.floor(Math.random() * speeches.length)];
            sessionAttributes.score =  score - 1;
        }
        sessionAttributes.index += 1;
        return handlerInput.responseBuilder
            // .speak(`${answer === sessionAttributes.answer} ${typeof(answer)} ${typeof(sessionAttributes.answer)} answer: ${answer} actual answer: ${sessionAttributes.answer}`)
            .speak(speech)
            .getResponse();
    }
};


const QuestionHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuestionIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        // const slots = handlerInput.requestEnvelope.request.intent.slots;
        // const answer = slots['answer'].value;
        var options = ' ';
        
        if(sessionAttributes.questions.length === sessionAttributes.index + 1){
            return handlerInput.responseBuilder
            .speak(`You have answered all available questions in the quiz. Respond with the command, end quiz, to get your score and exit the quiz.`)
            .getResponse();
        }
        
        for(var i = 0; i<sessionAttributes.options[sessionAttributes.index].length; i++){
            if (i === sessionAttributes.options[sessionAttributes.index].length - 1) options += ' and ' + sessionAttributes.options[sessionAttributes.index][i] + '.';
            else if (i === 0) options += sessionAttributes.options[sessionAttributes.index][i] + ',';
            else options += ' ' + sessionAttributes.options[sessionAttributes.index][i] + ',';
        }
        
        const speakOutput = sessionAttributes.questions[sessionAttributes.index];
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(`${speakOutput} The options are ${options} Would you like to answer, pass, end the quiz, or for me to repeat the question?`)
            // .reprompt(answer)
            .getResponse();
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        return handlerInput.responseBuilder
            .speak("Ok, so you want me to repeat the question and answer choices?")
            .reprompt("Ok, so you want me to repeat the question and answer choices?")
            .getResponse();
    }
};

const QuizHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuizHandlingIntent';
    },
    async handle(handlerInput) {
            const response = await fetchQuiz();
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            let speech = '';
            speech = "Your quiz is ready, the rules are as follows: You will be given a question followed by answer choices. Then, you can choose to answer, pass on the question, or end the quiz. You score 1 point for every correct answer and lose 1 point for every wrong answer. Would you like to take the quiz?";
                // sessionAttributes.questions = ["How many states combined constitute to USA", "How many states are in India"];
                // sessionAttributes.answers = ["50", "29"];
                // sessionAttributes.options = [["20", "45", "50", "55"], ["53", "24", "10", "29"]];
                sessionAttributes.questions = response.quiz.questions;
                sessionAttributes.answers = response.quiz.answers;
                sessionAttributes.options = response.quiz.options;
                sessionAttributes.index = 0;
                sessionAttributes.score = 0;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            // if (response.ok === "true") {
            //     speech = "Your quiz is ready, the rules are as follows: you score 1 point for every correct answer and lose 1 point for every wrong one";
            //     sessionAttributes.question = "How many states combined constitute to USA";
            //     sessionAttributes.answer = "50"
            //     handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            // }
            // else speech = "There was a problem fetching your quiz, please generate a new quiz."
    return handlerInput.responseBuilder
            .speak(speech)
            .getResponse();
  },
}

const PassHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PassIntent';
    },
    async handle(handlerInput) {
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.index += 1;
    
    return handlerInput.responseBuilder
            .speak("Okay, would you like to be given the next question?")
            .reprompt("Okay, would you like to be given the next question?")
            .getResponse();
  },
}

const QuizGenHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuizGenIntent';
    },
    async handle(handlerInput) {
            const slots = handlerInput.requestEnvelope.request.intent.slots;
            const topic = slots['topic'].value;
            const response = await quizGenerator(topic);
    return handlerInput.responseBuilder
            .speak(`Your quiz is being generated on the topic: "${topic}", you'll be notified once it is ready.`)
            .getResponse();
  },
}

const EndQuizGenHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EndQuizIntent';
    },
    async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let score;
    if (sessionAttributes.score < 0) score = 0;
    else score = sessionAttributes.score;
    sessionAttributes.questions = [];
    sessionAttributes.answers = [];
    sessionAttributes.options = [];
    sessionAttributes.score = [];
    return handlerInput.responseBuilder.speak(`The quiz has ended; Your score is: ${score}.`).getResponse();
  },
}

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        AnswerHandler,
        QuestionHandler,
        QuizHandler,
        EndQuizGenHandler,
        RepeatIntentHandler,
        PassHandler,
        QuizGenHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();