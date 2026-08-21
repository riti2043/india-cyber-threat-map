import React, { useState } from 'react';

const stateDirectories = {
  KA: {
    name: "Karnataka (KA)",
    hindiName: "ಕರ್ನಾಟಕ",
    kannadaName: "ಕರ್ನಾಟಕ",
    score: "86% (Very High)",
    contacts: [
      { label: "Karnataka Disabled Welfare", phone: "080-22863333" },
      { label: "Emergency Medical Support (KA)", phone: "108" },
      { label: "State Elder/Pension Helpline", phone: "14567" },
      { label: "NIMHANS Mental Health Support", phone: "1800-599-0019" }
    ],
    downloads: [
      { label: "KA Pension Guidelines (PDF)", file: "KA_Pension_Guidelines_2026.pdf" },
      { label: "KA Medical Welfare Form (PDF)", file: "KA_Medical_Aid_Form.pdf" }
    ]
  },
  MH: {
    name: "Maharashtra (MH)",
    hindiName: "महाराष्ट्र",
    kannadaName: "ಮಹಾರಾಷ್ಟ್ರ",
    score: "78% (High)",
    contacts: [
      { label: "MH Disabled Welfare Department", phone: "022-22025211" },
      { label: "State Social Justice Help Desk", phone: "1800-222-012" },
      { label: "Emergency Healthcare Support", phone: "104" }
    ],
    downloads: [
      { label: "MH Disability Pension Scheme (PDF)", file: "MH_Pension_Scheme_2026.pdf" },
      { label: "MH Senior Citizen Card Guide (PDF)", file: "MH_Senior_Card.pdf" }
    ]
  },
  UP: {
    name: "Uttar Pradesh (UP)",
    hindiName: "उत्तर प्रदेश",
    kannadaName: "ಉತ್ತರ ಪ್ರದೇಶ",
    score: "58% (Moderate)",
    contacts: [
      { label: "UP Divyangjan Kalyan Vibhag", phone: "1800-180-1995" },
      { label: "UP State Welfare Board", phone: "0522-2286120" },
      { label: "Citizen Emergency Response", phone: "112" }
    ],
    downloads: [
      { label: "UP Viklang Pension Application Form (PDF)", file: "UP_Viklang_Pension.pdf" },
      { label: "UP Divyang Scheme Handbook (PDF)", file: "UP_Divyang_Handbook.pdf" }
    ]
  },
  RJ: {
    name: "Rajasthan (RJ)",
    hindiName: "राजस्थान",
    kannadaName: "ರಾಜಸ್ಥಾನ",
    score: "66% (Moderate)",
    contacts: [
      { label: "Rajasthan Social Justice Dept", phone: "0141-2226602" },
      { label: "State Welfare Toll-Free Helpline", phone: "181" },
      { label: "Emergency Medical Service (RJ)", phone: "108" }
    ],
    downloads: [
      { label: "RJ Social Security Schemes Guide (PDF)", file: "RJ_Social_Security_Guidelines.pdf" }
    ]
  },
  GJ: {
    name: "Gujarat (GJ)",
    hindiName: "गुजरात",
    kannadaName: "ಗುಜರಾತ್",
    score: "74% (High)",
    contacts: [
      { label: "Gujarat Social Defense Dept", phone: "079-23251211" },
      { label: "State Disability Commissioner office", phone: "079-23253724" }
    ],
    downloads: [
      { label: "GJ Divyang Welfare Schemes (PDF)", file: "GJ_Divyang_Welfare.pdf" }
    ]
  },
  HR: {
    name: "Haryana & Delhi (HR/DL)",
    hindiName: "हरियाणा और दिल्ली",
    kannadaName: "ಹರಿಯಾಣ ಮತ್ತು ದೆಹಲಿ",
    score: "82% (High)",
    contacts: [
      { label: "Delhi Social Welfare Help", phone: "011-23381395" },
      { label: "Delhi Govt Toll-Free Service", phone: "1031" },
      { label: "National Disabled Helpline Center", phone: "1800-110-193" }
    ],
    downloads: [
      { label: "DL Disability Certificate Procedure (PDF)", file: "DL_Certificate_Guide.pdf" },
      { label: "DL Widow & Old Age Pension Form (PDF)", file: "DL_Pension_Form.pdf" }
    ]
  },
  DEFAULT: {
    name: "National Support Center (IN)",
    hindiName: "राष्ट्रीय सहायता केंद्र",
    kannadaName: "ರಾಷ್ಟ್ರೀಯ ಸಹಾಯ ಕೇಂದ್ರ",
    score: "65% (Moderate)",
    contacts: [
      { label: "National Social Security Portal", phone: "1800-11-1967" },
      { label: "Ministry of Social Justice Helpline", phone: "1967" },
      { label: "National Disaster Management Helpline", phone: "1078" }
    ],
    downloads: [
      { label: "Universal Disability ID Card Manual (PDF)", file: "UDID_Card_Manual.pdf" },
      { label: "Pradhan Mantri Welfare Schemes Guide (PDF)", file: "PM_Welfare_Handbook.pdf" }
    ]
  }
};

export default function InclusionMap({ t, lang, speakFeedback }) {
  const [selectedState, setSelectedState] = useState("KA");

  const handleStateClick = (stateCode) => {
    setSelectedState(stateCode);
    const data = stateDirectories[stateCode] || stateDirectories["DEFAULT"];
    let name = data.name;
    if (lang === "hi") name = data.hindiName || data.name;
    if (lang === "kn") name = data.kannadaName || data.name;

    speakFeedback(`Loaded contacts directory for ${name}. Inclusion index is ${data.score}`);
  };

  const activeData = stateDirectories[selectedState] || stateDirectories["DEFAULT"];
  
  let activeName = activeData.name;
  if (lang === "hi") activeName = activeData.hindiName || activeData.name;
  if (lang === "kn") activeName = activeData.kannadaName || activeData.name;

  return (
    <div className="panel-layout-split">
      
      {/* SVG Map Section */}
      <div className="panel-card" style={{ flex: 1.2 }}>
        <div className="card-header">
          <h3><i className="fa-solid fa-map"></i> India Inclusion Map</h3>
        </div>
        <div className="card-body" style={{ background: 'rgba(10,11,16,0.3)', overflow: 'auto' }}>
          <svg className="india-svg" viewBox="0 0 650 780" xmlns="http://www.w3.org/2000/svg">
            {/* Jammu and Kashmir */}
            <path 
              d="M 288,142 L 310,105 L 324,84 L 320,58 L 328,52 L 356,58 L 374,78 L 374,106 L 348,138 L 330,166 L 312,176 L 288,178 L 278,162 Z" 
              className={`map-state ${selectedState === 'JK' ? 'active' : ''}`}
              onClick={() => handleStateClick("JK")}
            />
            {/* Himachal Pradesh */}
            <path 
              d="M 312,176 L 330,166 L 348,176 L 366,172 L 368,198 L 348,214 L 328,212 L 316,192 Z" 
              className={`map-state ${selectedState === 'HP' ? 'active' : ''}`}
              onClick={() => handleStateClick("HP")}
            />
            {/* Punjab */}
            <path 
              d="M 278,206 L 288,178 L 312,176 L 316,192 L 328,212 L 316,236 L 286,242 L 266,218 Z" 
              className={`map-state ${selectedState === 'PB' ? 'active' : ''}`}
              onClick={() => handleStateClick("PB")}
            />
            {/* Uttarakhand */}
            <path 
              d="M 348,214 L 368,198 L 386,220 L 402,238 L 390,266 L 368,266 L 356,248 L 346,232 Z" 
              className={`map-state ${selectedState === 'UK' ? 'active' : ''}`}
              onClick={() => handleStateClick("UK")}
            />
            {/* Haryana and Delhi */}
            <path 
              d="M 306,236 L 328,212 L 348,214 L 346,232 L 356,248 L 354,268 L 342,284 L 318,284 Z" 
              className={`map-state ${selectedState === 'HR' ? 'active' : ''}`}
              onClick={() => handleStateClick("HR")}
            />
            {/* Rajasthan */}
            <path 
              d="M 174,334 L 212,284 L 266,218 L 286,242 L 306,236 L 318,284 L 342,284 L 326,356 L 314,394 L 294,402 L 244,402 L 202,374 Z" 
              className={`map-state ${selectedState === 'RJ' ? 'active' : ''}`}
              onClick={() => handleStateClick("RJ")}
            />
            {/* Gujarat */}
            <path 
              d="M 128,426 L 178,416 L 202,374 L 244,402 L 246,456 L 242,504 L 218,506 L 190,472 L 164,484 L 144,466 Z" 
              className={`map-state ${selectedState === 'GJ' ? 'active' : ''}`}
              onClick={() => handleStateClick("GJ")}
            />
            {/* Madhya Pradesh */}
            <path 
              d="M 244,402 L 294,402 L 314,394 L 326,356 L 342,284 L 354,268 L 368,266 L 394,324 L 422,336 L 432,364 L 416,400 L 438,446 L 400,478 L 354,472 L 306,494 L 246,456 Z" 
              className={`map-state ${selectedState === 'MP' ? 'active' : ''}`}
              onClick={() => handleStateClick("MP")}
            />
            {/* Uttar Pradesh */}
            <path 
              d="M 354,268 L 368,266 L 390,266 L 402,238 L 432,260 L 486,298 L 514,310 L 504,334 L 458,374 L 428,374 L 416,400 L 432,364 L 422,336 L 394,324 L 354,268 Z" 
              className={`map-state ${selectedState === 'UP' ? 'active' : ''}`}
              onClick={() => handleStateClick("UP")}
            />
            {/* Maharashtra */}
            <path 
              d="M 218,506 L 242,504 L 246,456 L 306,494 L 354,472 L 372,508 L 386,554 L 368,582 L 332,606 L 298,602 L 260,598 L 244,562 Z" 
              className={`map-state ${selectedState === 'MH' ? 'active' : ''}`}
              onClick={() => handleStateClick("MH")}
            />
            {/* Bihar */}
            <path 
              d="M 504,334 L 544,306 L 574,332 L 568,374 L 524,386 L 498,372 Z" 
              className={`map-state ${selectedState === 'BR' ? 'active' : ''}`}
              onClick={() => handleStateClick("BR")}
            />
            {/* Jharkhand */}
            <path 
              d="M 524,386 L 568,374 L 576,420 L 532,456 L 506,442 Z" 
              className={`map-state ${selectedState === 'JH' ? 'active' : ''}`}
              onClick={() => handleStateClick("JH")}
            />
            {/* West Bengal */}
            <path 
              d="M 574,332 L 592,324 L 602,362 L 590,396 L 580,446 L 584,484 L 562,476 L 556,450 L 576,420 L 568,374 Z" 
              className={`map-state ${selectedState === 'WB' ? 'active' : ''}`}
              onClick={() => handleStateClick("WB")}
            />
            {/* Odisha */}
            <path 
              d="M 492,488 L 532,456 L 576,420 L 556,450 L 562,476 L 548,528 L 496,554 L 468,524 Z" 
              className={`map-state ${selectedState === 'OD' ? 'active' : ''}`}
              onClick={() => handleStateClick("OD")}
            />
            {/* Chhattisgarh */}
            <path 
              d="M 400,478 L 438,446 L 458,452 L 492,488 L 468,524 L 456,584 L 414,548 Z" 
              className={`map-state ${selectedState === 'CG' ? 'active' : ''}`}
              onClick={() => handleStateClick("CG")}
            />
            {/* Telangana */}
            <path 
              d="M 372,508 L 400,478 L 414,548 L 456,584 L 416,616 L 386,590 Z" 
              className={`map-state ${selectedState === 'TS' ? 'active' : ''}`}
              onClick={() => handleStateClick("TS")}
            />
            {/* Andhra Pradesh */}
            <path 
              d="M 386,590 L 416,616 L 456,584 L 496,554 L 448,702 L 412,714 L 396,664 Z" 
              className={`map-state ${selectedState === 'AP' ? 'active' : ''}`}
              onClick={() => handleStateClick("AP")}
            />
            {/* Karnataka */}
            <path 
              d="M 260,598 L 298,602 L 332,606 L 368,582 L 386,590 L 396,664 L 412,714 L 378,720 L 354,722 L 342,704 L 318,658 Z" 
              className={`map-state state-neon-home ${selectedState === 'KA' ? 'active' : ''}`}
              onClick={() => handleStateClick("KA")}
            />
            {/* Goa */}
            <path 
              d="M 280,642 L 294,642 L 292,652 L 280,650 Z" 
              className={`map-state ${selectedState === 'GA' ? 'active' : ''}`}
              onClick={() => handleStateClick("GA")}
            />
            {/* Kerala */}
            <path 
              d="M 342,704 L 354,722 L 356,762 L 342,764 L 326,718 Z" 
              className={`map-state ${selectedState === 'KL' ? 'active' : ''}`}
              onClick={() => handleStateClick("KL")}
            />
            {/* Tamil Nadu */}
            <path 
              d="M 354,722 L 378,720 L 412,714 L 420,746 L 386,778 L 356,762 Z" 
              className={`map-state ${selectedState === 'TN' ? 'active' : ''}`}
              onClick={() => handleStateClick("TN")}
            />
            {/* Northeast Group */}
            <path 
              d="M 602,362 L 632,342 L 648,374 L 644,416 L 612,410 Z" 
              className={`map-state ${selectedState === 'NE' ? 'active' : ''}`}
              onClick={() => handleStateClick("NE")}
            />

            <text x="290" y="650" fill="var(--neon-green)" fontSize="13" fontWeight="bold" pointerEvents="none">KA</text>
          </svg>
        </div>
      </div>

      {/* Directory Helplines Section */}
      <div className="panel-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-address-book"></i> Help Directory</h3>
        </div>
        
        <div className="card-body">
          <div className="directory-list-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div className="selected-state-banner">
              <span>{t("txt-selected-state-label") || "State:"}</span>
              <strong>{activeName} ({selectedState})</strong>
            </div>

            <div className="accessibility-score-badge">
              <span>{t("txt-state-score-label") || "Index:"}</span>
              <strong>{activeData.score}</strong>
            </div>

            <hr style={{ border: 'none', borderTop: '1.5px dashed rgba(255,255,255,0.1)' }} />
            
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
              <i className="fa-solid fa-phone-volume" style={{ color: 'var(--neon-cyan)', marginRight: '6px' }}></i> Helplines:
            </h4>
            
            <ul className="helpline-contact-list">
              {activeData.contacts.map((contact, i) => (
                <li key={i} onClick={() => {
                  speakFeedback(`Calling ${contact.label} at ${contact.phone}`);
                  window.location.href = `tel:${contact.phone}`;
                }}>
                  <strong>{contact.label}:</strong>
                  <span style={{ color: 'var(--neon-cyan)' }}>{contact.phone}</span>
                </li>
              ))}
            </ul>

            <hr style={{ border: 'none', borderTop: '1.5px dashed rgba(255,255,255,0.1)' }} />

            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
              <i className="fa-solid fa-file-pdf" style={{ color: 'var(--neon-magenta)', marginRight: '6px' }}></i> Forms & Guidelines:
            </h4>

            <div className="pdf-download-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeData.downloads.map((dl, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="pdf-link-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    speakFeedback(`Downloading ${dl.label}`);
                    alert(`Mock PDF Download Triggered: "${dl.file}"`);
                  }}
                >
                  <i className="fa-solid fa-file-arrow-down"></i>
                  <span>{dl.label}</span>
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
