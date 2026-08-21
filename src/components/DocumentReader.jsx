import React, { useState, useEffect, useRef } from 'react';

const jargonDictionary = {
  "collateral": {
    en: "property/assets pledged to secure a loan which the bank can seize if you fail to pay",
    hi: "बैंक के पास गिरवी रखी संपत्ति जिसे लोन न चुकाने पर बैंक जब्त कर सकता है",
    kn: "ಸಾಲ ಮರುಪಾವತಿಸಲು ವಿಫಲವಾದರೆ ಬ್ಯಾಂಕ್ ಮುಟ್ಟುಗೋಲು ಹಾಕಿಕೊಳ್ಳಬಹುದಾದ ಆಸ್ತಿ"
  },
  "amortization": {
    en: "paying off a debt gradually with scheduled monthly installments over time",
    hi: "समय के साथ मासिक किश्तों में धीरे-धीरे ऋण का भुगतान करने की एक तय योजना",
    kn: "ಸಾಲವನ್ನು ಹಂತ ಹಂತವಾಗಿ ಮಾಸಿಕ ಕಂತುಗಳಲ್ಲಿ ಮರುಪಾವತಿ ಮಾಡುವ ನಿಗದಿತ ಯೋಜನೆ"
  },
  "lien": {
    en: "the bank's legal authority to retain possession of your assets until debt is settled",
    hi: "कर्ज चुकाए जाने तक आपकी संपत्ति पर बैंक का कानूनी अधिकार",
    kn: "ಸಾಲ ತೀರುವವರೆಗೆ ನಿಮ್ಮ ಆಸ್ತಿಯನ್ನು ಬ್ಯಾಂಕ್ ತನ್ನ ಸುಪರ್ದಿಯಲ್ಲಿಟ್ಟುಕೊಳ್ಳುವ ಕಾನೂನುಬದ್ಧ ಹಕ್ಕು"
  },
  "escrow": {
    en: "a secure third-party holding account safe-guarding funds before receiver transfer",
    hi: "एक सुरक्षित तीसरा खाता जहाँ पैसा पाने वाले को भेजने से पहले सुरक्षित रखा जाता है",
    kn: "ಹಣವನ್ನು ಸ್ವೀಕರಿಸುವವರಿಗೆ ಕಳುಹಿಸುವ ಮೊದಲು ಸುರಕ್ಷಿತವಾಗಿಡಲು ಬಳಸುವ ತೃತೀಯ ಖಾತೆ"
  },
  "principal": {
    en: "the original sum of money borrowed or invested, excluding added interest rates",
    hi: "उधार ली गई या निवेश की गई मूल राशि, ब्याज जोड़ने से पहले",
    kn: "ಬಡ್ಡಿ ಸೇರಿಸುವ ಮೊದಲು ನೀವು ಎರವಲು ಪಡೆದ ಅಥವಾ ಹೂಡಿಕೆ ಮಾಡಿದ ಮೂಲ ಮೊತ್ತ"
  },
  "subcutaneous": {
    en: "injected or applied directly beneath the skin surface layer",
    hi: "त्वचा की ऊपरी परत के ठीक नीचे लगाया जाने वाला इंजेक्शन या दवा",
    kn: "ಚರ್ಮದ ಪದರದ ಕೆಳಗೆ ನೇರವಾಗಿ ನೀಡಲಾಗುವ ಇಂಜೆಕ್ಷನ್ ಅಥವಾ ಔಷಧ"
  },
  "myocardial infarction": {
    en: "a sudden heart attack from blocked blood flow to the heart muscles",
    hi: "दिल की मांसपेशियों में रक्त प्रवाह रुकने के कारण होने वाला अचानक दिल का दौरा",
    kn: "ಹೃದಯದ ಸ್ನಾಯುಗಳಿಗೆ ರಕ್ತ ಪರಿಚಲನೆ ನಿಲ್ಲುವುದರಿಂದ ಉಂಟಾಗುವ ಹೃದಯಾಘಾತ"
  },
  "hypertension": {
    en: "chronic high blood pressure straining blood vessels and internal organs",
    hi: "उच्च रक्तचाप जो रक्त वाहिकाओं और अंगों पर अतिरिक्त दबाव डालता है",
    kn: "ರಕ್ತದೊತ್ತಡ ಹೆಚ್ಚಾಗುವುದು (ರಕ್ತನಾಳಗಳು ಮತ್ತು ಅಂಗಗಳ ಮೇಲೆ ಹೆಚ್ಚುವರಿ ಒತ್ತಡ)"
  },
  "b.i.d.": {
    en: "twice daily medication directions",
    hi: "इस दवा को दिन में दो बार लें",
    kn: "ಈ ಔಷಧಿಯನ್ನು ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ"
  },
  "p.o.": {
    en: "orally administered by mouth",
    hi: "इस दवा को मुंह से लें",
    kn: "ಈ ಔಷಧಿಯನ್ನು ಬಾಯಿಯ ಮೂಲಕ ತೆಗೆದುಕೊಳ್ಳಿ"
  },
  "beneficiary": {
    en: "the person designated to receive pension, money, or welfare supplies",
    hi: "वह व्यक्ति जिसे सरकारी योजना से पैसा, पेंशन या मुफ्त राशन मिलता है (लाभार्थी)",
    kn: "ಸರ್ಕಾರಿ ಯೋಜನೆಯಿಂದ ಹಣ, ಪಿಂಚಣಿ ಅಥವಾ ಉಚಿತ ಪಡಿತರ ಪಡೆಯುವ ಅರ್ಹ ವ್ಯಕ್ತಿ (ಫಲಾನುಭವಿ)"
  },
  "subsidy": {
    en: "a financial discount/grant given by the government to make grains cheaper",
    hi: "सरकार द्वारा दी जाने वाली वित्तीय छूट ताकि सामान जनता के लिए सस्ता हो सके",
    kn: "ಸಾಮಗ್ರಿಗಳನ್ನು ಅಗ್ಗವಾಗಿಸಲು ಸರ್ಕಾರ ನೀಡುವ ಆರ್ಥಿಕ ರಿಯಾಯಿತಿ (ಸಹಾಯಧನ)"
  },
  "affidavit": {
    en: "a signed legal document of truth sworn in front of a magistrate",
    hi: "एक हस्ताक्षरित कानूनी दस्तावेज जिसमें शपथ लेकर सच होने का दावा किया जाता है (हलफनामा)",
    kn: "ಅಧಿಕಾರಿಯ ಮುಂದೆ ಪ್ರಮಾಣೀಕರಿಸಲಾದ ಲಿಖಿತ ಸತ್ಯ ಹೇಳಿಕೆ ಪತ್ರ (ಪ್ರಮಾಣಪತ್ರ)"
  },
  "domicile": {
    en: "the physical country/state you legally designate as permanent home",
    hi: "वह स्थान जहाँ आप कानूनी रूप से स्थायी निवास करते हैं (मूल निवासी प्रमाण)",
    kn: "ನೀವು ಕಾನೂನುಬದ್ಧವಾಗಿ ವಾಸಿಸುತ್ತಿರುವ ಕಾಯಂ ಸ್ಥಳ (ವಾಸಸ್ಥಳ ಧೃಡೀಕರಣ)"
  }
};

const presets = {
  bank: `LOAN SECURITY DEED\nThe borrower covenants to hand over collateral to the lender. In the event of default, a lien shall be registered immediately against the assets. The principal amount is subject to amortization rates over an escrow holding period of 60 months.`,
  health: `PRESCRIPTION RULES\nPatient diagnosed with acute hypertension. Recommended dosage: 10mg p.o., b.i.d. for prophylaxis. If inflammation escalates, administer subcutaneous injection at clinical center.`,
  govt: `ANNUAL ALLOCATION GUIDELINES\nThe beneficiary of the state pension scheme must file a signed affidavit of domicile along with income certificates to claim the monthly grains subsidy and allocation.`
};

export default function DocumentReader({ t, lang, speakFeedback }) {
  const [rawText, setRawText] = useState("");
  const [simplifiedHtml, setSimplifiedHtml] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isRulerActive, setIsRulerActive] = useState(false);
  
  // TTS State
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [activeWordIdx, setActiveWordIdx] = useState(-1);

  const displayPaneRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  // Initialize Speech Voices
  useEffect(() => {
    const updateVoices = () => {
      if (window.speechSynthesis) {
        const list = window.speechSynthesis.getVoices();
        setVoices(list);
        const defaultV = list.find(v => v.lang.includes("IN") || v.default)?.name || "";
        setSelectedVoice(defaultV);
      }
    };
    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Sync simplification output to text inputs
  useEffect(() => {
    if (!rawText.trim()) {
      setSimplifiedHtml(`<div class="output-placeholder">${t("output-placeholder-txt")}</div>`);
      return;
    }

    const activeLang = lang || "en";
    let processed = rawText;

    // Jargon translation mappings
    const jargonKeys = Object.keys(jargonDictionary).sort((a, b) => b.length - a.length);
    jargonKeys.forEach(jargon => {
      const def = jargonDictionary[jargon][activeLang] || jargonDictionary[jargon]["en"];
      const regex = new RegExp(`\\b${jargon}\\b`, 'gi');
      processed = processed.replace(regex, (match) => {
        return `<span class="jargon-word" data-definition="${def}">${match}</span>`;
      });
    });

    // Tokenize text nodes into spans for TTS highlights
    const tokens = processed.split(/(\s+|<[^>]+>)/g);
    let wordCounter = 0;

    const formatted = tokens.map(token => {
      if (!token.trim()) return token;
      if (token.startsWith("<") && token.endsWith(">")) return token;

      const element = `<span class="karaoke-word" id="react-kw-${wordCounter}">${token}</span>`;
      wordCounter++;
      return element;
    }).join("");

    setSimplifiedHtml(formatted);
  }, [rawText, lang]);

  // OCR Processing
  const handleOcrFile = (e) => {
    const file = e.target.files[0];
    if (file) performOcr(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      performOcr(file);
    } else {
      alert("Invalid format. Please drop an image file (JPG, PNG).");
    }
  };

  const performOcr = (file) => {
    if (!window.Tesseract) {
      alert("OCR package loader is currently busy or offline.");
      return;
    }
    setIsOcrLoading(true);
    setOcrProgress(0);

    window.Tesseract.recognize(
      file,
      'eng+hin',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      }
    ).then(({ data: { text } }) => {
      setIsOcrLoading(false);
      setRawText(text);
      speakFeedback("OCR Complete. Document Text Extracted.");
    }).catch(err => {
      console.error(err);
      setIsOcrLoading(false);
      alert("OCR process failed. Please ensure file resolution is readable.");
    });
  };

  // Text-To-Speech
  const startReading = () => {
    if (!window.speechSynthesis || !displayPaneRef.current) return;
    window.speechSynthesis.cancel();

    const plainText = displayPaneRef.current.textContent.trim();
    if (!plainText || plainText.includes("Simplification output will")) return;

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = ttsSpeed;

    const matchVoice = voices.find(v => v.name === selectedVoice);
    if (matchVoice) utterance.voice = matchVoice;

    if (lang === "hi") {
      utterance.lang = "hi-IN";
    } else if (lang === "kn") {
      utterance.lang = "kn-IN";
    } else {
      utterance.lang = "en-US";
    }

    utterance.onboundary = (e) => {
      if (e.name !== "word") return;
      
      const charIndex = e.charIndex;
      const spokenPart = plainText.substring(0, charIndex);
      const words = spokenPart.trim().split(/\s+/);
      const count = spokenPart.trim() === "" ? 0 : words.length;

      setActiveWordIdx(count);

      // Scroll targeted span into view
      const activeEl = document.getElementById(`react-kw-${count}`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    };

    utterance.onend = () => {
      setActiveWordIdx(-1);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveWordIdx(-1);
  };

  // Reading Ruler movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const ruler = document.getElementById("reading-ruler");
      if (ruler && isRulerActive) {
        ruler.style.top = `${e.clientY - 11}px`;
      }
    };
    if (isRulerActive) {
      const ruler = document.getElementById("reading-ruler");
      if (ruler) ruler.style.display = "block";
      document.body.addEventListener("mousemove", handleMouseMove);
    } else {
      const ruler = document.getElementById("reading-ruler");
      if (ruler) ruler.style.display = "none";
      document.body.removeEventListener("mousemove", handleMouseMove);
    }
    return () => {
      document.body.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isRulerActive]);

  // Apply visual highlights to nodes on state change
  useEffect(() => {
    document.querySelectorAll(".karaoke-word").forEach(span => {
      span.classList.remove("speech-highlight");
    });
    if (activeWordIdx !== -1) {
      const activeEl = document.getElementById(`react-kw-${activeWordIdx}`);
      if (activeEl) activeEl.classList.add("speech-highlight");
    }
  }, [activeWordIdx]);

  return (
    <div className="panel-layout-split">
      
      {/* Upload & Raw Text Card */}
      <div className="panel-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-file-image"></i> Document OCR Scan</h3>
          <label htmlFor="react-reader-upload" className="upload-btn" style={{ padding: '5px 10px', fontSize: '0.65rem' }}>
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload
          </label>
          <input 
            type="file" 
            id="react-reader-upload" 
            accept="image/*" 
            onChange={handleOcrFile} 
            style={{ display: 'none' }} 
          />
        </div>

        <div className="card-body">
          <div 
            className="ocr-drag-spot" 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
          >
            <i className="fa-solid fa-file-signature"></i>
            <p>{t("ocr-drag-txt")}</p>
          </div>

          {isOcrLoading && (
            <div style={{ margin: '5px 0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', marginBottom: '3px' }}>
                OCR Scanning: {ocrProgress}%
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--neon-cyan)', width: `${ocrProgress}%`, transition: 'width 0.1s ease' }}></div>
              </div>
            </div>
          )}

          <textarea 
            className="reader-textarea" 
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste technical, legal, medical, or administrative text directly here to simplify..."
          />

          <div className="preset-row">
            <button className="preset-btn" onClick={() => setRawText(presets.bank)}>Banking Preset</button>
            <button className="preset-btn" onClick={() => setRawText(presets.health)}>Medical Preset</button>
            <button className="preset-btn" onClick={() => setRawText(presets.govt)}>Welfare Preset</button>
          </div>
        </div>
      </div>

      {/* Simplified Output Card */}
      <div className="panel-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-brain"></i> Simplified Output</h3>
        </div>
        
        <div className="card-body relative">
          <div 
            ref={displayPaneRef}
            className="simplified-display-pane"
            dangerouslySetInnerHTML={{ __html: simplifiedHtml }}
          />

          <div className="reading-ruler-control-row">
            <button 
              className={`compact-btn ${isRulerActive ? 'active' : ''}`}
              onClick={() => setIsRulerActive(!isRulerActive)}
            >
              <i className="fa-solid fa-grip-lines"></i> {t("txt-toggle-ruler") || "Line Ruler"}
            </button>
          </div>
        </div>

        {/* TTS Player Panel */}
        <div className="tts-player-controls">
          <button onClick={startReading} className="player-btn" title="Play">
            <i className="fa-solid fa-play"></i>
          </button>
          <button onClick={stopReading} className="player-btn" title="Stop">
            <i className="fa-solid fa-stop"></i>
          </button>
          
          <div className="tts-speed-control">
            <i className="fa-solid fa-gauge-high"></i>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={ttsSpeed} 
              onChange={(e) => setTtsSpeed(parseFloat(e.target.value))} 
            />
            <span>{ttsSpeed.toFixed(1)}x</span>
          </div>

          <div className="tts-voice-control">
            <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name.substring(0, 15)} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

    </div>
  );
}
