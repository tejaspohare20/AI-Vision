/**
 * AI Vision Assistant — client-only logic.
 * - Camera: getUserMedia
 * - Objects: TensorFlow.js COCO-SSD (detects bottle, person, chair, phone, etc.)
 * - OCR / currency: Tesseract.js
 * - TTS / STT: Web Speech API (speechSynthesis, SpeechRecognition)
 *
 * Note: Browsers block microphone and sometimes speech until the user interacts.
 *       One tap on the start screen enables mic + voice + camera automatically.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Language packs: UI strings + BCP-47 tags for speech synthesis
  // ---------------------------------------------------------------------------
  const LANG = {
    en: {
      code: 'en',
      speech: 'en-US',
      title: 'AI Vision Assistant',
      subtitle: 'For blind and visually impaired users',
      tapTitle: 'Tap to start assistant',
      tapHelp:
        'One tap enables microphone and camera. Voice listening starts automatically — speak commands without using buttons.',
      tapButton: 'Start — enable mic and camera',
      startCamera: 'Start Camera',
      stopCamera: 'Stop Camera',
      detectObject: 'Detect Object',
      readText: 'Read Text',
      detectCurrency: 'Detect Currency',
      languageLabel: 'Language',
      startVoice: 'Start Voice Control',
      stopVoice: 'Stop Voice Control',
      footer: 'All processing happens in your browser. No data is sent to a server.',
      statusReady: 'Ready.',
      statusCameraOn: 'Camera is on.',
      statusCameraOff: 'Camera is off.',
      statusLoadingModel: 'Loading AI model…',
      statusListening: 'Listening for your voice.',
      statusVoiceOff: 'Voice listening paused. Tap Start Voice Control to resume.',
      welcome:
        'Welcome. The camera is on and I am listening. Say detect object, read text, or detect currency.',
      objectPrefix: 'There is',
      objectSuffix: 'in front of you.',
      objectUnknown: 'No clear object found. Point the camera at the item and say detect object again.',
      readNoText: 'No text was detected. Try holding the document steadier.',
      currencyNone: 'Could not read a rupee amount on this note. Try again.',
      currencyIs: 'This is a',
      currencySuffix: 'rupee note.',
      voiceHint:
        'Try: start camera, stop camera, detect object, what is this, read text, detect currency, change language.',
      voiceNotSupported: 'Speech recognition is not supported in this browser. Use Chrome or Edge.',
      needCamera: 'Camera is starting. Wait a moment, then try again.',
      busy: 'Please wait…',
      assistantStarted: 'Assistant started. Listening.',
    },
    hi: {
      code: 'hi',
      speech: 'hi-IN',
      title: 'एआई विज़न असिस्टेंट',
      subtitle: 'दृष्टिबाधित उपयोगकर्ताओं के लिए',
      tapTitle: 'शुरू करने के लिए टैप करें',
      tapHelp:
        'एक बार टैप करने से माइक और कैमरा चालू होते हैं। आवाज़ सुनना अपने आप शुरू हो जाता है।',
      tapButton: 'शुरू करें — माइक और कैमरा चालू करें',
      startCamera: 'कैमरा चालू करें',
      stopCamera: 'कैमरा बंद करें',
      detectObject: 'वस्तु पहचानें',
      readText: 'टेक्स्ट पढ़ें',
      detectCurrency: 'नोट पहचानें',
      languageLabel: 'भाषा',
      startVoice: 'आवाज़ नियंत्रण चालू करें',
      stopVoice: 'आवाज़ नियंत्रण बंद करें',
      footer: 'सब प्रोसेसिंग आपके ब्राउज़र में होती है। कोई डेटा सर्वर पर नहीं जाता।',
      statusReady: 'तैयार।',
      statusCameraOn: 'कैमरा चालू है।',
      statusCameraOff: 'कैमरा बंद है।',
      statusLoadingModel: 'एआई मॉडल लोड हो रहा है…',
      statusListening: 'आपकी आवाज़ सुन रहा हूँ।',
      statusVoiceOff: 'आवाज़ रुकी। फिर से चालू करने के लिए बटन दबाएँ।',
      welcome:
        'स्वागत है। कैमरा चालू है और मैं सुन रहा हूँ। डिटेक्ट ऑब्जेक्ट, रीड टेक्स्ट या डिटेक्ट करेंसी कहें।',
      objectPrefix: 'आपके सामने',
      objectSuffix: 'है।',
      objectUnknown: 'वस्तु साफ़ नहीं पहचानी। कैमरा सामान की तरफ रखें और फिर कहें।',
      readNoText: 'कोई टेक्स्ट नहीं मिला। कागज़ स्थिर रखें।',
      currencyNone: 'नोट की राशि नहीं पढ़ी जा सकी। फिर कोशिश करें।',
      currencyIs: 'यह',
      currencySuffix: 'रूपये का नोट है।',
      voiceHint:
        'कहें: स्टार्ट कैमरा, स्टॉप कैमरा, डिटेक्ट ऑब्जेक्ट, वॉट इज दिस, रीड टेक्स्ट, डिटेक्ट करेंसी।',
      voiceNotSupported: 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं।',
      needCamera: 'कैमरा चालू हो रहा है। थोड़ा इंतज़ार करें।',
      busy: 'कृपया प्रतीक्षा करें…',
      assistantStarted: 'असिस्टेंट चालू। सुन रहा हूँ।',
    },
    mr: {
      code: 'mr',
      speech: 'mr-IN',
      title: 'एआय व्हिजन असिस्टंट',
      subtitle: 'दृष्टीदोष असलेल्या वापरकर्त्यांसाठी',
      tapTitle: 'सुरू करण्यासाठी टॅप करा',
      tapHelp:
        'एकदा टॅप केल्यावर माइक आणि कॅमेरा सुरू होतात. आवाज ऐकणे आपोआप सुरू होते.',
      tapButton: 'सुरू करा — माइक आणि कॅमेरा सुरू करा',
      startCamera: 'कॅमेरा सुरू करा',
      stopCamera: 'कॅमेरा थांबवा',
      detectObject: 'वस्तू ओळखा',
      readText: 'मजकूर वाचा',
      detectCurrency: 'नोट ओळखा',
      languageLabel: 'भाषा',
      startVoice: 'आवाज नियंत्रण सुरू करा',
      stopVoice: 'आवाज नियंत्रण थांबवा',
      footer: 'सर्व प्रक्रिया तुमच्या ब्राउझरमध्ये. सर्व्हरवर डेटा जात नाही.',
      statusReady: 'तयार.',
      statusCameraOn: 'कॅमेरा सुरू आहे.',
      statusCameraOff: 'कॅमेरा बंद आहे.',
      statusLoadingModel: 'एआय मॉडल लोड होत आहे…',
      statusListening: 'आवाज ऐकत आहे.',
      statusVoiceOff: 'आवाज थांबला. पुन्हा सुरू करण्यासाठी बटण दाबा.',
      welcome:
        'स्वागत. कॅमेरा सुरू आहे आणि मी ऐकत आहे. डिटेक्ट ऑब्जेक्ट, रीड टेक्स्ट किंवा डिटेक्ट करन्सी म्हणा.',
      objectPrefix: 'तुमच्या समोर',
      objectSuffix: 'आहे.',
      objectUnknown: 'वस्तू स्पष्ट ओळखली नाही. कॅमेरा वस्तूकडे ठेवा आणि पुन्हा म्हणा.',
      readNoText: 'मजकूर सापडला नाही. कागद स्थिर ठेवा.',
      currencyNone: 'नोटाची रक्कम वाचता आली नाही. पुन्हा प्रयत्न करा.',
      currencyIs: 'हा',
      currencySuffix: 'रुपयांचा नोट आहे.',
      voiceHint:
        'म्हणा: स्टार्ट कॅमेरा, स्टॉप कॅमेरा, डिटेक्ट ऑब्जेक्ट, वॉट इज दिस, रीड टेक्स्ट, डिटेक्ट करन्सी.',
      voiceNotSupported: 'या ब्राउझरमध्ये स्पीच ओळख उपलब्ध नाही.',
      needCamera: 'कॅमेरा सुरू होत आहे. थोडा वेळ थांबा.',
      busy: 'कृपया प्रतीक्षा करा…',
      assistantStarted: 'असिस्टंट सुरू. ऐकत आहे.',
    },
  };

  const ORDER = ['en', 'hi', 'mr'];
  const INR_VALUES = [2000, 500, 200, 100, 50, 20, 10];

  // ---------------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------------
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('status');
  const detectionEl = document.getElementById('detection-output');
  const languageSelect = document.getElementById('language-select');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');
  const btnDetect = document.getElementById('btn-detect-object');
  const btnRead = document.getElementById('btn-read-text');
  const btnCurrency = document.getElementById('btn-detect-currency');
  const btnVoice = document.getElementById('btn-voice-control');
  const voiceHintEl = document.getElementById('voice-hint');
  const appTitle = document.getElementById('app-title');
  const appSubtitle = document.getElementById('app-subtitle');
  const labelLanguage = document.getElementById('label-language');
  const footerText = document.getElementById('footer-text');
  const startOverlay = document.getElementById('start-overlay');
  const tapStartTitle = document.getElementById('tap-start-title');
  const tapStartHelp = document.getElementById('tap-start-help');
  const btnStartAssistant = document.getElementById('btn-start-assistant');

  let currentLangKey = languageSelect.value || 'en';
  function t() {
    return LANG[currentLangKey] || LANG.en;
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let stream = null;
  let cocoModel = null;
  let tesseractWorker = null;
  let recognition = null;
  /** True after first tap — voice is meant to stay on unless user pauses */
  let voiceListening = false;
  let assistantActive = false;
  let busy = false;
  let lastHeardCmd = '';
  let lastHeardAt = 0;
  let voicesReady = false;
  /** Keeps mic permission active; helps speech recognition on some phones/browsers */
  let audioStream = null;
  /** True while TTS is speaking — we pause STT so the mic does not hear the app voice */
  let ttsSpeaking = false;

  // ---------------------------------------------------------------------------
  // TTS: pick a clear default voice for the selected language (fixes "wrong" voice)
  // ---------------------------------------------------------------------------
  function refreshVoices() {
    if (typeof window.speechSynthesis === 'undefined') return;
    window.speechSynthesis.getVoices();
    voicesReady = true;
  }

  function pickVoiceForLang(langTag) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;
    const base = (langTag || 'en-US').split('-')[0].toLowerCase();

    const prefer = function (v) {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith(base) || l.indexOf(base + '-') === 0;
    };

    let v = voices.find(function (x) {
      return prefer(x) && /google|microsoft|natural|premium/i.test(x.name + x.voiceURI);
    });
    if (!v) v = voices.find(prefer);
    if (!v && base === 'en') {
      v = voices.find(function (x) {
        return (x.lang || '').toLowerCase().startsWith('en');
      });
    }
    return v || voices[0];
  }

  /** Pause speech recognition while the app talks (avoids echo + missed commands). */
  function pauseRecognitionForTts() {
    if (!recognition || !voiceListening) return;
    try {
      recognition.stop();
    } catch (e) {
      /* ignore */
    }
  }

  function resumeRecognitionAfterTts() {
    if (!voiceListening || !assistantActive || !recognition) return;
    ttsSpeaking = false;
    setTimeout(function () {
      if (!voiceListening || !assistantActive) return;
      try {
        recognition.start();
      } catch (e) {
        console.warn('resumeRecognitionAfterTts', e);
      }
    }, 350);
  }

  /**
   * Speak text. While speaking, Web Speech recognition is paused so your microphone
   * is not confused by the assistant's own voice (common cause of "not listening").
   */
  function speak(text, opts) {
    if (!text || typeof window.speechSynthesis === 'undefined') return;
    ttsSpeaking = true;
    pauseRecognitionForTts();

    const utter = new SpeechSynthesisUtterance(text);
    const lang = (opts && opts.lang) || t().speech;
    utter.lang = lang;
    utter.rate = opts && opts.rate != null ? opts.rate : 0.9;
    utter.pitch = opts && opts.pitch != null ? opts.pitch : 1;
    const v = pickVoiceForLang(lang);
    if (v) utter.voice = v;

    utter.onend = function () {
      if (opts && typeof opts.onEnd === 'function') opts.onEnd();
      resumeRecognitionAfterTts();
    };
    utter.onerror = function () {
      resumeRecognitionAfterTts();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  if (typeof window.speechSynthesis !== 'undefined') {
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    refreshVoices();
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function setDetection(msg) {
    detectionEl.textContent = msg || '';
  }

  function applyLanguageUI() {
    const tr = t();
    appTitle.textContent = tr.title;
    appSubtitle.textContent = tr.subtitle;
    labelLanguage.textContent = tr.languageLabel;
    footerText.textContent = tr.footer;
    btnStart.textContent = tr.startCamera;
    btnStop.textContent = tr.stopCamera;
    btnDetect.textContent = tr.detectObject;
    btnRead.textContent = tr.readText;
    btnCurrency.textContent = tr.detectCurrency;
    btnVoice.textContent = voiceListening ? tr.stopVoice : tr.startVoice;
    voiceHintEl.textContent = tr.voiceHint;
    tapStartTitle.textContent = tr.tapTitle;
    tapStartHelp.textContent = tr.tapHelp;
    btnStartAssistant.textContent = tr.tapButton;
    document.documentElement.lang = tr.code === 'en' ? 'en' : tr.code;
  }

  // ---------------------------------------------------------------------------
  // Camera
  // ---------------------------------------------------------------------------
  /**
   * @param {object} [opts]
   * @param {boolean} [opts.silent] - if true, no spoken feedback (used when assistant starts in one flow)
   */
  async function startCamera(opts) {
    if (stream) return;
    const silent = opts && opts.silent;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      btnStart.disabled = true;
      btnStop.disabled = false;
      btnDetect.disabled = false;
      btnRead.disabled = false;
      btnCurrency.disabled = false;
      setStatus(t().statusCameraOn);
      if (!silent) speak(t().statusCameraOn);
    } catch (e) {
      console.error(e);
      setStatus('Camera error: ' + (e.message || String(e)));
      speak('Camera could not be started. Check permissions.', { lang: 'en-US' });
    }
  }

  function stopCamera() {
    if (!stream) return;
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
    stream = null;
    video.srcObject = null;
    btnStart.disabled = false;
    btnStop.disabled = true;
    btnDetect.disabled = true;
    btnRead.disabled = true;
    btnCurrency.disabled = true;
    setStatus(t().statusCameraOff);
    speak(t().statusCameraOff);
  }

  function captureFrame() {
    if (!stream || !video.videoWidth) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  /**
   * Upscale + grayscale/contrast so Tesseract reads words instead of jumbled letters.
   * @param {HTMLCanvasElement} sourceCanvas
   * @param {number} scale — 2–2.5 works well for book text
   */
  function preprocessCanvasForOcr(sourceCanvas, scale) {
    const sc = Math.min(Math.max(scale || 2, 1.5), 3);
    const w = Math.round(Math.min(sourceCanvas.width * sc, 2600));
    const h = Math.round((sourceCanvas.height / sourceCanvas.width) * w);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(sourceCanvas, 0, 0, w, h);
    const img = cx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = y > 140 ? Math.min(255, y * 1.15) : Math.max(0, y * 0.85);
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
    }
    cx.putImageData(img, 0, 0);
    return c;
  }

  /**
   * OCR often outputs "T h e   b o o k" — merge single-character Latin tokens into words
   * so speech reads sentences, not letter-by-letter.
   */
  function fixSpacedOutLetters(text) {
    if (!text || text.length < 4) return text;
    const lines = text.split(/\r?\n/);
    return lines
      .map(function (line) {
        const tokens = line.trim().split(/\s+/);
        if (tokens.length < 4) return line.trim();
        const singleLatin = tokens.filter(function (tok) {
          return tok.length === 1 && /[A-Za-z0-9]/.test(tok);
        }).length;
        if (singleLatin / tokens.length < 0.3) return line.trim();
        const out = [];
        let i = 0;
        while (i < tokens.length) {
          const t = tokens[i];
          if (t.length === 1 && /[A-Za-z0-9]/.test(t)) {
            let word = t;
            i++;
            while (
              i < tokens.length &&
              tokens[i].length === 1 &&
              /[A-Za-z0-9]/.test(tokens[i])
            ) {
              word += tokens[i];
              i++;
            }
            out.push(word);
          } else {
            out.push(t);
            i++;
          }
        }
        return out.join(' ');
      })
      .filter(Boolean)
      .join(' ');
  }

  function normalizeBookText(raw) {
    if (!raw) return '';
    let s = raw.replace(/\r\n/g, '\n').replace(/\u00a0/g, ' ');
    s = fixSpacedOutLetters(s);
    s = s.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return s;
  }

  // ---------------------------------------------------------------------------
  // COCO-SSD: detects real objects (bottle, person, cell phone, chair, …)
  // ---------------------------------------------------------------------------
  async function ensureCoco(silent) {
    if (cocoModel) return cocoModel;
    const coco = window.cocoSsd;
    if (!coco || typeof coco.load !== 'function') {
      throw new Error('COCO-SSD not loaded. Check script tags / network.');
    }
    if (!silent) setStatus(t().statusLoadingModel);
    cocoModel = await coco.load();
    return cocoModel;
  }

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  /** Natural phrase for TTS: English uses a/an; Hindi/Marathi use translation strings. */
  function speakDetectedObject(className) {
    const tr = t();
    if (currentLangKey === 'en') {
      const an = /^[aeiou]/i.test(className) ? 'an' : 'a';
      speak('There is ' + an + ' ' + className + ' in front of you.', { lang: 'en-US' });
      return;
    }
    speak(tr.objectPrefix + ' ' + className + ' ' + tr.objectSuffix, { lang: tr.speech });
  }

  async function runObjectDetection() {
    if (busy) {
      speak(t().busy);
      return;
    }
    if (!stream || !video.videoWidth) {
      speak(t().needCamera);
      setStatus(t().needCamera);
      return;
    }
    busy = true;
    try {
      await ensureCoco(false);
      // Run on live video — works better than a single frozen frame for moving hands
      const predictions = await cocoModel.detect(video, 10, 0.25);
      if (!predictions || predictions.length === 0) {
        setDetection('');
        speak(t().objectUnknown);
        return;
      }
      predictions.sort(function (a, b) {
        return b.score - a.score;
      });
      const top = predictions[0];
      const name = capitalizeWords(top.class);
      const pct = (top.score * 100).toFixed(0);
      let line = name + ' — ' + pct + '%';
      if (predictions.length > 1 && predictions[1].score > 0.35) {
        line += ' · also ' + capitalizeWords(predictions[1].class);
      }
      setDetection(line);
      speakDetectedObject(top.class);
    } catch (e) {
      console.error(e);
      setDetection('');
      speak(t().objectUnknown);
    } finally {
      busy = false;
      if (stream) setStatus(t().statusCameraOn);
    }
  }

  // ---------------------------------------------------------------------------
  // Tesseract OCR
  // ---------------------------------------------------------------------------
  async function ensureTesseract() {
    if (tesseractWorker) return tesseractWorker;
    const Tess = window.Tesseract;
    if (!Tess || typeof Tess.createWorker !== 'function') {
      throw new Error('Tesseract not loaded');
    }
    tesseractWorker = await Tess.createWorker();
    await tesseractWorker.loadLanguage('eng+hin');
    await tesseractWorker.initialize('eng+hin');
    return tesseractWorker;
  }

  /**
   * Book / document: block of text mode (PSM 6) + LSTM — reads words/lines, not single glyphs.
   */
  async function runReadText() {
    if (busy) {
      speak(t().busy);
      return;
    }
    if (!stream) {
      speak(t().needCamera);
      return;
    }
    busy = true;
    setStatus('Reading text…');
    try {
      const frame = captureFrame();
      if (!frame) {
        speak(t().readNoText);
        return;
      }
      const pre = preprocessCanvasForOcr(frame, 2.2);
      const worker = await ensureTesseract();
      await worker.setParameters({
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1',
        tessedit_ocr_engine_mode: '1',
      });
      const {
        data: { text },
      } = await worker.recognize(pre);
      const cleaned = normalizeBookText(text);
      setDetection(cleaned || '—');
      if (!cleaned) {
        speak(t().readNoText);
      } else {
        const toSpeak = cleaned.length > 3500 ? cleaned.slice(0, 3500) + '…' : cleaned;
        speak(toSpeak, { rate: 0.88, lang: t().speech });
      }
    } catch (e) {
      console.error(e);
      speak(t().readNoText);
    } finally {
      busy = false;
      setStatus(t().statusCameraOn);
    }
  }

  /** Normalize OCR noise before searching for ₹ amounts (O vs 0, spaces in digits). */
  function normalizeForCurrencySearch(text) {
    if (!text) return '';
    let s = text.replace(/\s+/g, '');
    s = s.replace(/[OоΟ]/g, '0');
    s = s.replace(/[l|]/g, '1');
    return s;
  }

  function parseInrFromText(text) {
    if (!text) return null;
    const upper = text.toUpperCase().replace(/\s+/g, ' ');
    const wordMap = {
      TEN: 10,
      TWENTY: 20,
      FIFTY: 50,
      HUNDRED: 100,
      TWOHUNDRED: 200,
      'TWO HUNDRED': 200,
      FIVEHUNDRED: 500,
      'FIVE HUNDRED': 500,
    };
    for (const w of Object.keys(wordMap)) {
      if (wordMap[w] != null && upper.includes(w)) return wordMap[w];
    }
    const compact = normalizeForCurrencySearch(text);
    for (const v of INR_VALUES) {
      const re = new RegExp('(?:^|[^0-9])' + v + '(?:[^0-9]|$)');
      if (re.test(text) || re.test(compact)) return v;
    }
    const rupeeMatch = text.match(/[₹]\s*(\d{2,4})/) || text.match(/(?:RS|RS\.|INR)\s*[:\s]?\s*(\d{2,4})/i);
    if (rupeeMatch) {
      const n = parseInt(rupeeMatch[1], 10);
      if (INR_VALUES.indexOf(n) >= 0 || n === 2000) return n;
    }
    const anyNum = compact.match(/(\d{3,4})/g);
    if (anyNum) {
      for (const chunk of anyNum) {
        const n = parseInt(chunk, 10);
        if (INR_VALUES.indexOf(n) >= 0 || n === 2000) return n;
      }
    }
    return null;
  }

  /**
   * Notes: try several page modes; upscale image so numerals on the note are readable.
   */
  async function runDetectCurrency() {
    if (busy) {
      speak(t().busy);
      return;
    }
    if (!stream) {
      speak(t().needCamera);
      return;
    }
    busy = true;
    setStatus('Detecting currency…');
    try {
      const frame = captureFrame();
      if (!frame) {
        speak(t().currencyNone);
        return;
      }
      const pre = preprocessCanvasForOcr(frame, 2.8);
      const worker = await ensureTesseract();
      let bestText = '';
      let amount = null;
      const modes = ['6', '7', '11'];
      for (let m = 0; m < modes.length && amount == null; m++) {
        await worker.setParameters({
          tessedit_pageseg_mode: modes[m],
          tessedit_ocr_engine_mode: '1',
        });
        const {
          data: { text },
        } = await worker.recognize(pre);
        bestText += ' ' + (text || '');
        amount = parseInrFromText(bestText);
      }
      const tr = t();
      if (amount == null) {
        const show = normalizeBookText(bestText).slice(0, 220) || '—';
        setDetection(show);
        speak(tr.currencyNone);
      } else {
        setDetection(String(amount) + ' ₹');
        speak(tr.currencyIs + ' ' + amount + ' ' + tr.currencySuffix);
      }
    } catch (e) {
      console.error(e);
      speak(t().currencyNone);
    } finally {
      busy = false;
      setStatus(t().statusCameraOn);
    }
  }

  // ---------------------------------------------------------------------------
  // Speech recognition — flexible English phrases (STT works best in English)
  // ---------------------------------------------------------------------------
  function getRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }

  function normalizeCommand(raw) {
    return (raw || '')
      .toLowerCase()
      .replace(/[.,!?']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Ignore the exact same phrase twice in a row (STT often fires duplicates). */
  function isDuplicatePhrase(cmd) {
    const now = Date.now();
    if (cmd === lastHeardCmd && now - lastHeardAt < 450) return true;
    lastHeardCmd = cmd;
    lastHeardAt = now;
    return false;
  }

  function handleVoiceCommand(transcript) {
    const cmd = normalizeCommand(transcript);
    if (!cmd) return;
    if (isDuplicatePhrase(cmd)) return;

    if (cmd.includes('start camera') || cmd.includes('camera on') || cmd.includes('turn on the camera')) {
      startCamera();
      return;
    }
    if (cmd.includes('stop camera') || cmd.includes('camera off') || cmd.includes('turn off the camera')) {
      stopCamera();
      return;
    }
    if (
      cmd.includes('detect object') ||
      cmd.includes('detect objects') ||
      cmd.includes('what is this') ||
      cmd.includes('what is that') ||
      cmd.includes("what's this") ||
      cmd.includes("what's that") ||
      cmd.includes('what do you see') ||
      cmd.includes('identify object') ||
      cmd.includes('find object')
    ) {
      runObjectDetection();
      return;
    }
    if (cmd.includes('read text') || cmd.includes('read the text') || cmd.includes('ocr')) {
      runReadText();
      return;
    }
    if (cmd.includes('detect currency') || cmd.includes('read currency') || cmd.includes('rupee') || cmd.includes('money note')) {
      runDetectCurrency();
      return;
    }
    if (cmd.includes('change language')) {
      const idx = ORDER.indexOf(currentLangKey);
      const next = ORDER[(idx + 1) % ORDER.length];
      languageSelect.value = next;
      currentLangKey = next;
      applyLanguageUI();
      speak(t().welcome, { lang: t().speech });
      return;
    }
  }

  function setupRecognition() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      voiceHintEl.textContent = t().voiceNotSupported;
      return null;
    }
    const rec = new Ctor();
    // Indian English often matches the user's accent better than US-only
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 5;

    rec.onresult = function (event) {
      let best = '';
      const last = event.results.length - 1;
      for (let i = 0; i < event.results[last].length; i++) {
        const t0 = event.results[last][i].transcript;
        if (t0.length > best.length) best = t0;
      }
      handleVoiceCommand(best || event.results[last][0].transcript);
    };
    rec.onerror = function (e) {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setStatus('Microphone denied. Reload and allow the microphone.');
        speak('Microphone permission denied.', { lang: 'en-US' });
      }
      if (e.error === 'aborted' || e.error === 'no-speech') {
        return;
      }
      console.warn('Speech recognition:', e.error);
    };
    rec.onend = function () {
      if (ttsSpeaking) return;
      if (voiceListening && assistantActive) {
        try {
          rec.start();
        } catch (err) {
          setTimeout(function () {
            if (ttsSpeaking) return;
            if (voiceListening && assistantActive) {
              try {
                rec.start();
              } catch (e2) {
                console.warn(e2);
              }
            }
          }, 300);
        }
      }
    };
    return rec;
  }

  function startVoiceListening() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      speak(t().voiceNotSupported, { lang: 'en-US' });
      return;
    }
    if (!recognition) recognition = setupRecognition();
    if (!recognition) return;
    voiceListening = true;
    assistantActive = true;
    applyLanguageUI();
    try {
      recognition.start();
    } catch (e) {
      console.warn('recognition.start', e);
    }
    setStatus(t().statusListening);
  }

  function stopVoiceListening() {
    voiceListening = false;
    applyLanguageUI();
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        /* ignore */
      }
    }
    setStatus(t().statusVoiceOff);
    speak(t().statusVoiceOff);
  }

  function toggleVoiceControl() {
    if (!assistantActive) {
      speak('Tap the start screen first to enable the microphone.', { lang: 'en-US' });
      return;
    }
    if (voiceListening) stopVoiceListening();
    else startVoiceListening();
  }

  // ---------------------------------------------------------------------------
  // One tap: satisfies browser security, then camera + voice + optional welcome
  // ---------------------------------------------------------------------------
  /** Opens the mic stream so the browser keeps listening; helps speech recognition on mobile. */
  async function ensureMicrophoneStream() {
    if (audioStream) return;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
    } catch (e) {
      console.warn('Optional microphone stream:', e);
    }
  }

  async function activateAssistant() {
    if (!startOverlay) return;
    startOverlay.hidden = true;
    applyLanguageUI();

    try {
      await ensureCoco(true);
    } catch (e) {
      console.error(e);
      setStatus('AI model failed to load. Check internet.');
      speak('The vision model could not load. Check your connection.', { lang: 'en-US' });
    }

    await ensureMicrophoneStream();
    await startCamera({ silent: true });
    startVoiceListening();
    setStatus(t().statusListening);
    speak(t().assistantStarted, { lang: t().speech });
    setTimeout(function () {
      speak(t().welcome, { lang: t().speech });
    }, 2200);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  btnStart.addEventListener('click', startCamera);
  btnStop.addEventListener('click', stopCamera);
  btnDetect.addEventListener('click', runObjectDetection);
  btnRead.addEventListener('click', runReadText);
  btnCurrency.addEventListener('click', runDetectCurrency);
  btnVoice.addEventListener('click', toggleVoiceControl);

  if (btnStartAssistant) {
    btnStartAssistant.addEventListener('click', function () {
      activateAssistant();
    });
  }

  if (startOverlay) {
    startOverlay.addEventListener('click', function (e) {
      if (e.target === startOverlay) activateAssistant();
    });
  }

  languageSelect.addEventListener('change', function () {
    currentLangKey = languageSelect.value;
    applyLanguageUI();
    if (assistantActive) speak(t().welcome, { lang: t().speech });
  });

  window.addEventListener('beforeunload', function () {
    stopCamera();
    voiceListening = false;
    if (audioStream) {
      audioStream.getTracks().forEach(function (trk) {
        trk.stop();
      });
      audioStream = null;
    }
    if (tesseractWorker) tesseractWorker.terminate();
  });

  // Preload model in background (faster after tap)
  applyLanguageUI();
  setStatus(t().statusLoadingModel);
  ensureCoco(true)
    .then(function () {
      setStatus(t().statusReady + ' ' + t().tapTitle);
    })
    .catch(function () {
      setStatus(t().statusReady + ' (model will load when you tap)');
    });
})();
