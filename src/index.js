import _concat from 'lodash/fp/concat';
import _isEqual from 'lodash/fp/isEqual';
import _once from 'lodash/fp/once';
import _uniqWith from 'lodash/fp/uniqWith';
import { v1 as uuid } from 'node-uuid';

const uniqDeep = _uniqWith(_isEqual);

class SpeechRecognitionEvent {
  constructor({ iosResult, maxAlternatives, type }) {
    const browserResults = [];
    const iosTranscriptionCount = Math.min(iosResult.transcriptions.length, maxAlternatives);
    const iosTranscriptionSegmentCount = iosResult.bestTranscription.segments.length;

    for (let i = 0; i < iosTranscriptionCount; i += 1) {
      const iosTranscription = iosResult.transcriptions[i];

      for (let j = 0; j < iosTranscriptionSegmentCount; j += 1) {
        const iosTranscriptionSegment = iosTranscription.segments[j];

        browserResults[j] = uniqDeep(_concat(browserResults[j] || [], {
          confidence: iosTranscriptionSegment.confidence,
          transcript: iosTranscriptionSegment.substring,
        }));

        browserResults[j].isFinal = iosResult.isFinal;
      }
    }

    this.resultIndex = 1;
    this.results = browserResults;
    this.type = type;
  }
}

class SpeechRecognition {
  constructor(options = {}) {
    this.id = uuid();
    this.window = options.window || global.window;
    this.plugin = options.plugin || this.window.cordova.plugins.SpeechRecognitionIos;
  }

  abort() {
    this.aborted = true;
    this.stop();
  }

  start() {
    const locale = this.lang === undefined ? this.window.navigator.language : this.lang;
    const init = { locale };
    const shouldReportPartialResults = this.continuous;
    const speechRecognitionRequest = { shouldReportPartialResults };
    const opts = { init, speechRecognitionRequest };

    if (this.running) return;
    if (this.onstart) this.onstart();
    if (this.onaudiostart) this.onaudiostart();
    this.onspeechstartOnce = this.onspeechstart ? _once(this.onspeechstart) : null;
    this.aborted = false;
    this.running = true;
    this.plugin.start(this.id, opts, this.startSuccess.bind(this), this.startFailure.bind(this));
  }

  startSuccess(iosResult) {
    const interimResults = this.interimResults === undefined ? true : this.interimResults;
    const maxAlternatives = this.maxAlternatives || 1;
    const type = 'result';
    if (this.aborted) return;
    if (!interimResults && !iosResult.isFinal) return;
    if (this.onspeechstartOnce) this.onspeechstartOnce();
    if (!this.onresult) return;
    this.onresult(new SpeechRecognitionEvent({ maxAlternatives, iosResult, type }));
  }

  startFailure(err) {
    if (this.onerror) this.onerror(err);
    this.plugin.stop(this.id);
  }

  stop() {
    if (this.onspeechend) this.onspeechend();
    if (this.onaudioend) this.onaudioend();
    if (this.onend) this.onend();
    this.plugin.stop(this.id);
    this.running = false;
  }
}

export {
  SpeechRecognition,
  SpeechRecognitionEvent,
};
