import React, { useState, useEffect, useRef } from 'react';

export default function VoiceSuite({ t, lang, speakFeedback }) {
  const [activeSubTab, setActiveSubTab] = useState("filler"); // filler, transcriber
  const [formLang, setFormLang] = useState("kn-IN"); // Kannada input default

  // Form Fields
  const [fieldName, setFieldName] = useState("");
  const [fieldAge, setFieldAge] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [fieldPhone, setFieldPhone] = useState("");
  const [fieldAddress, setFieldAddress] = useState("");
  const [fieldIncome, setFieldIncome] = useState("");

  const [activeFieldMic, setActiveFieldMic] = useState(null); // active listening field ID
  const [reviewMessage, setReviewMessage] = useState("Click 'Read Out Form' to confirm the input values before compiling PDF.");

  // Transcriber States
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("Waiting for input...");
  const [actionItems, setActionItems] = useState([]);

  const fieldRecognitionRef = useRef(null);
  const noteRecognitionRef = useRef(null);

  // Sync Form Language with active application language changes
  useEffect(() => {
    if (lang === "hi") {
      setFormLang("hi-IN");
    } else if (lang === "kn") {
      setFormLang("kn-IN");
    } else {
      setFormLang("en-US");
    }
  }, [lang]);

  // Form Field Mic Recognition
  const toggleFieldSpeech = (fieldId) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (fieldRecognitionRef.current) {
      try { fieldRecognitionRef.current.stop(); } catch (e) {}
      fieldRecognitionRef.current = null;
      
      if (activeFieldMic === fieldId) {
        setActiveFieldMic(null);
        return;
      }
    }

    setActiveFieldMic(fieldId);
    speakFeedback("Listening");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = formLang;

    recognition.onstart = () => {
      const indicator = document.getElementById("voice-indicator");
      if (indicator) {
        indicator.classList.remove("hidden");
        document.getElementById("voice-text").textContent = "Recording Field Value...";
      }
    };

    recognition.onresult = (e) => {
      const spokenText = e.results[0][0].transcript;
      const parsed = parseSpokenFieldValue(spokenText, fieldId);
      
      if (fieldId === "name") setFieldName(parsed);
      if (fieldId === "age") setFieldAge(parsed);
      if (fieldId === "id") setFieldId(parsed);
      if (fieldId === "phone") setFieldPhone(parsed);
      if (fieldId === "address") setFieldAddress(parsed);
      if (fieldId === "income") setFieldIncome(parsed);

      speakFeedback(`Entered ${parsed}`);
    };

    recognition.onend = () => {
      setActiveFieldMic(null);
      const indicator = document.getElementById("voice-indicator");
      if (indicator) indicator.classList.add("hidden");
    };

    recognition.onerror = (err) => {
      console.error(err);
      setActiveFieldMic(null);
    };

    fieldRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const parseSpokenFieldValue = (text, fieldId) => {
    let clean = text.trim();
    if (clean.endsWith(".")) clean = clean.slice(0, -1);

    // Filter phrases in English, Hindi, and Kannada
    clean = clean.replace(/^(my name is|my age is|my phone is|my mobile is|my address is|my income is|my details are)\s+/i, "");
    clean = clean.replace(/^(aadhaar is|aadhaar number is|pension number is|name is|age is)\s+/i, "");
    clean = clean.replace(/^(मेरा नाम है|मेरी उम्र है|मेरा आधार है|मेरा फोन नंबर है|मेरा पता है|मेरी आमदनी है)\s+/i, "");
    clean = clean.replace(/^(ನನ್ನ ಹೆಸರು|ನನ್ನ ವಯಸ್ಸು|ನನ್ನ ಆಧಾರ್|ನನ್ನ ಫೋನ್|ನನ್ನ ವಿಳಾಸ|ನನ್ನ ಆದಾಯ)\s+/i, "");
    clean = clean.replace(/\s*(है|हूँ|ಆಗಿದೆ|ಇದೆ)$/i, "");

    if (fieldId === "age") {
      const match = clean.match(/\d+/);
      if (match) clean = match[0];
    }
    if (fieldId === "id" || fieldId === "phone") {
      clean = clean.replace(/\s+/g, "");
    }
    return clean;
  };

  // Form Details spoken read-back verification
  const readOutForm = () => {
    let review = "";
    if (lang === "hi") {
      review = `कृपया प्रपत्र विवरणों की पुष्टि करें। `;
      review += fieldName ? `नाम: ${fieldName}। ` : "नाम खाली है। ";
      review += fieldAge ? `उम्र: ${fieldAge} वर्ष। ` : "उम्र खाली है। ";
      review += fieldId ? `आधार संख्या: ${fieldId.split("").join(" ")}। ` : "आधार खाली है। ";
      review += fieldPhone ? `मोबाइल नंबर: ${fieldPhone.split("").join(" ")}। ` : "मोबाइल खाली है। ";
      review += fieldAddress ? `पता: ${fieldAddress}। ` : "पता खाली है। ";
      review += fieldIncome ? `मासिक आय का स्रोत: ${fieldIncome}। ` : "आय खाली है। ";
    } else if (lang === "kn") {
      review = `ದಯವಿಟ್ಟು ನಿಮ್ಮ ಅರ್ಜಿ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. `;
      review += fieldName ? `ಹೆಸರು: ${fieldName}. ` : "ಹೆಸರು ಖಾಲಿ ಇದೆ. ";
      review += fieldAge ? `ವಯಸ್ಸು: ${fieldAge} ವರ್ಷಗಳು. ` : "ವಯಸ್ಸು ಖಾಲಿ ಇದೆ. ";
      review += fieldId ? `ಆಧಾರ್ ಸಂಖ್ಯೆ: ${fieldId.split("").join(" ")}. ` : "ಆಧಾರ್ ಖಾಲಿ ಇದೆ. ";
      review += fieldPhone ? `ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: ${fieldPhone.split("").join(" ")}. ` : "ಮೊಬೈಲ್ ಖಾಲಿ ಇದೆ. ";
      review += fieldAddress ? `ವಿಳಾಸ: ${fieldAddress}. ` : "ವಿಳಾಸ ಖಾಲಿ ಇದೆ. ";
      review += fieldIncome ? `ಆದಾಯ ಮೂಲ: ${fieldIncome}. ` : "ಆದಾಯ ಖಾಲಿ ಇದೆ. ";
    } else {
      review = `Please review your form details. `;
      review += fieldName ? `Name is ${fieldName}. ` : "Name is empty. ";
      review += fieldAge ? `Age is ${fieldAge} years. ` : "Age is empty. ";
      review += fieldId ? `Aadhaar number is ${fieldId.split("").join(" ")}. ` : "Aadhaar number is empty. ";
      review += fieldPhone ? `Mobile phone number is ${fieldPhone.split("").join(" ")}. ` : "Mobile is empty. ";
      review += fieldAddress ? `Address is ${fieldAddress}. ` : "Address is empty. ";
      review += fieldIncome ? `Income is ${fieldIncome}. ` : "Income details are empty. ";
    }

    setReviewMessage(review);
    speakFeedback(review);
  };

  // Compile PDF Welfare Form (html2pdf.js)
  const exportPDF = () => {
    const formElement = document.getElementById("gov-welfare-form");
    if (!formElement) return;

    speakFeedback("Compiling welfare application PDF");
    const options = {
      margin: 10,
      filename: `Aura_Welfare_Form_${fieldName || 'Citizen'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Temporarily add clean PDF print styling
    const originalStyle = formElement.style.cssText;
    formElement.style.cssText = "color: #111111 !important; background: #ffffff !important; padding: 20px !important; border: 1px solid #ccc !important;";
    
    // Inject print classes temporarily for labels
    document.querySelectorAll(".form-group label").forEach(lbl => lbl.style.color = "#222");

    window.html2pdf().from(formElement).set(options).save().then(() => {
      formElement.style.cssText = originalStyle;
      document.querySelectorAll(".form-group label").forEach(lbl => lbl.style.color = "");
      speakFeedback("PDF Download Complete.");
    });
  };

  // Transcriber Speech Recognition Note loop
  const toggleNoteRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isRecordingNote) {
      stopNoteRecording();
      return;
    }

    setIsRecordingNote(true);
    setTranscript("");
    setSummary("Processing audio note summary...");
    speakFeedback("Transcriber Recording Started");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-US";

    recognition.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        live += e.results[i][0].transcript;
      }
      setTranscript(live);
    };

    recognition.onend = () => {
      setIsRecordingNote(false);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setIsRecordingNote(false);
    };

    noteRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopNoteRecording = () => {
    if (noteRecognitionRef.current) {
      try { noteRecognitionRef.current.stop(); } catch (e) {}
      noteRecognitionRef.current = null;
    }
    setIsRecordingNote(false);
    
    // Auto-Summarize Mock engine
    setTimeout(() => {
      processMockNoteSummary();
    }, 800);
  };

  const processMockNoteSummary = () => {
    if (!transcript.trim()) {
      setSummary("No audio transcript registered.");
      setActionItems(["Empty."]);
      return;
    }

    const sentences = transcript.split(/[.।]+/);
    const bullets = sentences
      .filter(s => s.trim().length > 8)
      .slice(0, 3)
      .map(s => `• ${s.trim()}`);
    
    setSummary(bullets.join("\n") || "• Registered citizen instructions and verbal notes.");
    
    // Action points
    const actions = [];
    if (transcript.includes("document") || transcript.includes("aadhaar") || transcript.includes("पेंशन")) {
      actions.push("Submit signed Aadhaar card photocopy and age proof.");
    }
    if (transcript.includes("call") || transcript.includes("phone") || transcript.includes("नंबर")) {
      actions.push("Follow up with welfare officer phone helpline.");
    }
    actions.push("Verify monthly grains subsidy logs next Monday.");
    setActionItems(actions);

    speakFeedback("Summary notes generated.");
  };

  const copyToClipboard = () => {
    const textToCopy = `Live Transcript:\n${transcript}\n\nSummary:\n${summary}\n\nAction Items:\n${actionItems.join("\n")}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      speakFeedback("Copied summary details to clipboard.");
      alert("Summary copied to clipboard!");
    });
  };

  return (
    <div>
      <div className="suite-tabs">
        <button 
          className={`suite-tab ${activeSubTab === 'filler' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab("filler"); stopNoteRecording(); }}
        >
          <i className="fa-solid fa-file-waveform"></i> {t("txt-tab-filler")}
        </button>
        <button 
          className={`suite-tab ${activeSubTab === 'transcriber' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab("transcriber"); }}
        >
          <i className="fa-solid fa-microphone-lines"></i> {t("txt-tab-transcribe") || "Note Transcriber"}
        </button>
      </div>

      {/* Voice Form Filler Panel */}
      {activeSubTab === "filler" && (
        <div className="panel-layout-split">
          <div className="panel-card" style={{ flex: 1.3 }}>
            <div className="card-header">
              <h3><i className="fa-solid fa-keyboard"></i> Welfare Application</h3>
              <div className="form-language-options" style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => setFormLang("kn-IN")} 
                  className={`preset-btn ${formLang === 'kn-IN' ? 'active' : ''}`}
                  style={{ fontSize: '0.6rem', padding: '3px 8px' }}
                >
                  ಕನ್ನಡ
                </button>
                <button 
                  onClick={() => setFormLang("hi-IN")} 
                  className={`preset-btn ${formLang === 'hi-IN' ? 'active' : ''}`}
                  style={{ fontSize: '0.6rem', padding: '3px 8px' }}
                >
                  हिन्दी
                </button>
                <button 
                  onClick={() => setFormLang("en-US")} 
                  className={`preset-btn ${formLang === 'en-US' ? 'active' : ''}`}
                  style={{ fontSize: '0.6rem', padding: '3px 8px' }}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="card-body">
              <form id="gov-welfare-form" className="gov-welfare-form">
                <div className="form-title-stamp">
                  <h4>KARNATAKA WELFARE BOARD / ಸಮಾಜ ಕಲ್ಯಾಣ ಇಲಾಖೆ</h4>
                  <p>Application Form for Pension benefits</p>
                </div>
                
                <div className="form-group">
                  <label>1. Full Name / ಪೂರ್ಣ ಹೆಸರು</label>
                  <div className="input-mic-wrapper">
                    <input type="text" value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="Enter details..." />
                    <button type="button" onClick={() => toggleFieldSpeech("name")} className={`field-mic-btn ${activeFieldMic === 'name' ? 'active' : ''}`}><i className="fa-solid fa-microphone"></i></button>
                  </div>
                </div>

                <div className="form-group">
                  <label>2. Age / ವಯಸ್ಸು</label>
                  <div className="input-mic-wrapper">
                    <input type="number" value={fieldAge} onChange={(e) => setFieldAge(e.target.value)} placeholder="Enter age..." />
                    <button type="button" onClick={() => toggleFieldSpeech("age")} className={`field-mic-btn ${activeFieldMic === 'age' ? 'active' : ''}`}><i className="fa-solid fa-microphone"></i></button>
                  </div>
                </div>

                <div className="form-group">
                  <label>3. Aadhaar Number / ಆಧಾರ್ ಸಂಖ್ಯೆ</label>
                  <div className="input-mic-wrapper">
                    <input type="text" value={fieldId} onChange={(e) => setFieldId(e.target.value)} placeholder="Aadhaar number..." />
                    <button type="button" onClick={() => toggleFieldSpeech("id")} className={`field-mic-btn ${activeFieldMic === 'id' ? 'active' : ''}`}><i className="fa-solid fa-microphone"></i></button>
                  </div>
                </div>

                <div className="form-group">
                  <label>4. Mobile Phone / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ</label>
                  <div className="input-mic-wrapper">
                    <input type="tel" value={fieldPhone} onChange={(e) => setFieldPhone(e.target.value)} placeholder="Contact number..." />
                    <button type="button" onClick={() => toggleFieldSpeech("phone")} className={`field-mic-btn ${activeFieldMic === 'phone' ? 'active' : ''}`}><i className="fa-solid fa-microphone"></i></button>
                  </div>
                </div>

                <div className="form-group">
                  <label>5. Residence Address / ವಿಳಾಸ</label>
                  <div className="input-mic-wrapper">
                    <textarea value={fieldAddress} onChange={(e) => setFieldAddress(e.target.value)} placeholder="Residence details..."></textarea>
                    <button type="button" onClick={() => toggleFieldSpeech("address")} className={`field-mic-btn ${activeFieldMic === 'address' ? 'active' : ''}`}><i className="fa-solid fa-microphone"></i></button>
                  </div>
                </div>

                <div className="form-group">
                  <label>6. Monthly Income Source / ಆದಾಯ ಮೂಲ</label>
                  <div className="input-mic-wrapper">
                    <input type="text" value={fieldIncome} onChange={(e) => setFieldIncome(e.target.value)} placeholder="Income details..." />
                    <button type="button" onClick={() => toggleFieldSpeech("income")} className={`field-mic-btn ${activeFieldMic === 'income' ? 'active' : ''}`}><i className="fa-solid fa-microphone"></i></button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="panel-card">
            <div class="card-header">
              <h3><i className="fa-solid fa-comments"></i> Verification</h3>
            </div>
            
            <div className="card-body">
              <div className="verification-status-panel">
                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px' }}>{t("txt-review-status-title")}</h4>
                <div className="status-bullet-row">
                  <span className={`status-bullet ${fieldName ? 'checked' : ''}`}>Name</span>
                  <span className={`status-bullet ${fieldAge ? 'checked' : ''}`}>Age</span>
                  <span className={`status-bullet ${fieldId ? 'checked' : ''}`}>Aadhaar</span>
                  <span className={`status-bullet ${fieldPhone ? 'checked' : ''}`}>Mobile</span>
                  <span className={`status-bullet ${fieldAddress ? 'checked' : ''}`}>Address</span>
                  <span className={`status-bullet ${fieldIncome ? 'checked' : ''}`}>Income</span>
                </div>
              </div>

              <div className="voice-back-box">
                <p style={{ fontWeight: 'bold', color: 'var(--neon-cyan)', marginBottom: '5px' }}>
                  <i className="fa-solid fa-robot"></i> {t("voice-confirm-prompt")}
                </p>
                <div className="confirm-message" style={{ fontSize: '0.75rem', color: '#a0aabf' }}>
                  {reviewMessage}
                </div>
              </div>

              <div className="action-footer">
                <button type="button" onClick={readOutForm} className="secondary-btn btn-cyan w-full margin-bottom-sm">
                  <i className="fa-solid fa-bullhorn"></i> Read Out Form Details
                </button>
                <button type="button" onClick={exportPDF} className="primary-btn btn-magenta w-full">
                  <i className="fa-solid fa-file-pdf"></i> Compile Welfare Form PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Transcriber Panel */}
      {activeSubTab === "transcriber" && (
        <div className="panel-layout-split">
          <div className="panel-card">
            <div className="card-header">
              <h3><i className="fa-solid fa-microphone"></i> Audio Capture</h3>
            </div>
            
            <div className="card-body">
              <div className="transcribe-visualizer-container">
                <button 
                  type="button" 
                  onClick={toggleNoteRecording} 
                  className={`record-ring-btn ${isRecordingNote ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-microphone"></i>
                </button>
                <p style={{ fontSize: '0.75rem', marginTop: '10px' }}>
                  {isRecordingNote ? "Recording active. Speak now..." : "Click to start notes recording"}
                </p>
                {isRecordingNote && (
                  <div className="recording-audio-wave">
                    <span></span><span></span><span></span><span></span>
                  </div>
                )}
              </div>

              <div className="realtime-transcript-container">
                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: '8px 0 4px' }}>Live Transcript:</h4>
                <div className="transcript-box">
                  {transcript || "Speak to register verbal notes..."}
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="card-header">
              <h3><i className="fa-solid fa-receipt"></i> Summarizer</h3>
            </div>
            
            <div className="card-body">
              <div className="summarize-section" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Summary Points:</h4>
                <div className="summary-box" style={{ whiteSpace: 'pre-line' }}>
                  {summary}
                </div>
                
                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Action Items:</h4>
                <ul className="action-list">
                  {actionItems.length === 0 ? (
                    <li>Empty.</li>
                  ) : (
                    actionItems.map((act, index) => (
                      <li key={index}>{act}</li>
                    ))
                  )}
                </ul>
              </div>

              <button type="button" onClick={copyToClipboard} className="primary-btn w-full">
                <i className="fa-solid fa-copy"></i> Copy Summary to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
