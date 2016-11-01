# cordova-speech-recognition-ios-browser-polyfill

## Installation

    npm i --save-dev cordova-plugin-speech-recognition-ios
    npm i --save cordova-speech-recognition-ios-browser-polyfill

## Usage

    import SpeechRecognition as SpeechRecognitionIosPolyfill from 'cordova-speech-recognition-ios-browser-polyfill';

    if (!global.SpeechRecognition) {
      if (global.cordova && global.cordova.platformId === 'ios') {
        global.SpeechRecognition = SpeechRecognitionIosPolyfill;
      }
    }

## Note

The browser API returns partial speech segments comprised of alternatives.
However, the iOS API returns full speech alternatives comprised of partial segments.
Fortunately, each iOS alternative *appears to* contain an identical number of segments.
Therefore, we can easily convert from the iOS format to the browser's format.
If this behavior ever changes then this will no longer be possible, or at least... it will be harder.
