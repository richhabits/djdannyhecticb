import { Request, Response } from 'express';

interface AlexaRequest {
  version: string;
  session: {
    sessionId: string;
    user: {
      userId: string;
    };
  };
  request: {
    type: string;
    requestId: string;
    intent?: {
      name: string;
      slots?: Record<string, { value: string }>;
    };
  };
}

interface AlexaResponse {
  version: string;
  response: {
    outputSpeech: {
      type: 'PlainText' | 'SSML';
      text?: string;
      ssml?: string;
    };
    card?: {
      type: 'Simple';
      title: string;
      content: string;
    };
    shouldEndSession: boolean;
  };
}

/**
 * Handle Alexa skill requests
 */
export async function handleAlexaRequest(req: Request, res: Response) {
  const alexaRequest: AlexaRequest = req.body;

  try {
    let response: AlexaResponse;

    switch (alexaRequest.request.type) {
      case 'LaunchRequest':
        response = handleLaunch();
        break;
      
      case 'IntentRequest':
        response = await handleIntent(alexaRequest);
        break;
      
      case 'SessionEndedRequest':
        response = handleSessionEnd();
        break;
      
      default:
        response = buildResponse('I didn\'t understand that request.');
    }

    res.json(response);
  } catch (error) {
    console.error('[Alexa] Error handling request:', error);
    res.json(buildResponse('Sorry, something went wrong. Please try again.'));
  }
}

/**
 * Handle skill launch
 */
function handleLaunch(): AlexaResponse {
  return buildResponse(
    'Welcome to Hectic Radio! You can ask me to play live radio, request a track, or send a shout out. What would you like to do?',
    false
  );
}

/**
 * Handle intents
 */
async function handleIntent(request: AlexaRequest): Promise<AlexaResponse> {
  const intentName = request.request.intent?.name;

  switch (intentName) {
    case 'PlayLiveRadio':
      return handlePlayLiveRadio();
    
    case 'PlayMix':
      return handlePlayMix(request.request.intent?.slots?.MixName?.value);
    
    case 'RequestTrack':
      return handleRequestTrack(
        request.request.intent?.slots?.TrackName?.value,
        request.request.intent?.slots?.ArtistName?.value
      );
    
    case 'SendShoutOut':
      return handleSendShoutOut(
        request.session.user.userId,
        request.request.intent?.slots?.Message?.value
      );
    
    case 'WhatsPlaying':
      return await handleWhatsPlaying();
    
    case 'GetListenerCount':
      return await handleGetListenerCount();
    
    case 'AMAZON.HelpIntent':
      return handleHelp();
    
    case 'AMAZON.StopIntent':
    case 'AMAZON.CancelIntent':
      return handleStop();
    
    default:
      return buildResponse('I don\'t know how to help with that yet.');
  }
}

/**
 * Play live radio
 */
function handlePlayLiveRadio(): AlexaResponse {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: `<speak>Playing Hectic Radio live! <audio src="https://stream.hecticradio.com/live.mp3" /></speak>`,
      },
      shouldEndSession: true,
    },
  };
}

/**
 * Play specific mix
 */
function handlePlayMix(mixName?: string): AlexaResponse {
  if (!mixName) {
    return buildResponse('Which mix would you like to play?', false);
  }

  // TODO: Search for mix and play
  return buildResponse(`Playing ${mixName}`, true);
}

/**
 * Request a track
 */
function handleRequestTrack(trackName?: string, artistName?: string): AlexaResponse {
  if (!trackName) {
    return buildResponse('Which track would you like to request?', false);
  }

  // TODO: Submit track request to database
  const message = artistName 
    ? `I've requested ${trackName} by ${artistName} for you. It might be played on the next show!`
    : `I've requested ${trackName} for you. It might be played on the next show!`;

  return buildResponse(message);
}

/**
 * Send shout out
 */
function handleSendShoutOut(userId: string, message?: string): AlexaResponse {
  if (!message) {
    return buildResponse('What would you like to say in your shout out?', false);
  }

  // TODO: Submit shout out to database
  return buildResponse('Your shout out has been sent! It might be read on air soon.');
}

/**
 * What's playing now
 */
async function handleWhatsPlaying(): Promise<AlexaResponse> {
  // TODO: Get current track from API
  return buildResponse('Now playing: UK Garage Mix by DJ Danny Hectic B');
}

/**
 * Get listener count
 */
async function handleGetListenerCount(): Promise<AlexaResponse> {
  // TODO: Get real-time listener count from WebSocket server
  return buildResponse('There are currently 247 listeners tuned in to Hectic Radio!');
}

/**
 * Help intent
 */
function handleHelp(): AlexaResponse {
  return buildResponse(
    'You can ask me to play live radio, play a specific mix, request a track, send a shout out, or ask what\'s playing. What would you like to do?',
    false
  );
}

/**
 * Stop intent
 */
function handleStop(): AlexaResponse {
  return buildResponse('Thanks for listening to Hectic Radio!');
}

/**
 * Handle session end
 */
function handleSessionEnd(): AlexaResponse {
  return buildResponse('Goodbye!');
}

/**
 * Build Alexa response
 */
function buildResponse(text: string, shouldEndSession: boolean = true): AlexaResponse {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text,
      },
      shouldEndSession,
    },
  };
}

// Google Assistant handler (similar structure)
export async function handleGoogleAssistant(req: Request, res: Response) {
  // Similar implementation for Google Actions
  res.json({
    fulfillmentText: 'Welcome to Hectic Radio!',
  });
}
