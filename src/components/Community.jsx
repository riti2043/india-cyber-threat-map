import React, { useState } from 'react';

const STATE_SCHEMES = {
  Karnataka: [
    { name: "Karnataka State Disabled Pension", type: "Financial", desc: "Monthly financial aid for residents with 40% or more disability." },
    { name: "Karnataka Free Laptop Scheme for Students", type: "Education", desc: "Free laptops for disabled students pursuing higher education." }
  ],
  Delhi: [
    { name: "Delhi Disability Pension Scheme", type: "Financial", desc: "Financial assistance of Rs. 2500 per month for disabled Delhi residents." }
  ],
  Maharashtra: [
    { name: "Sanjay Gandhi Niradhar Anudan Yojana", type: "Financial", desc: "Financial support for disabled individuals below the poverty line." }
  ]
};

const GLOBAL_SCHEMES = [
  { name: "ADIP Scheme (Assistance to Disabled Persons)", type: "Assistive", desc: "Provides free aids and appliances (hearing aids, tricycles, braille kits) to disabled citizens." },
  { name: "UDID Card (Unique Disability ID)", type: "General", desc: "National single document identifier for disabled citizens to avail benefits." },
  { name: "NHFDC Scholarships", type: "Education", desc: "National Handicapped Finance and Development Corporation educational financial aid." }
];

const NGO_DIRECTORY = [
  { name: "Association of People with Disability (APD)", state: "Karnataka", phone: "+91-80-25475267", type: "Assistive" },
  { name: "National Association for the Blind (NAB)", state: "Delhi", phone: "+91-11-26176379", type: "Education" },
  { name: "Sense India", state: "Maharashtra", phone: "+91-22-26301323", type: "Assistive" },
  { name: "Enable India", state: "Karnataka", phone: "+91-80-25722648", type: "Employment" },
  { name: "Spastics Society of India", state: "Maharashtra", phone: "+91-22-26443666", type: "Assistive" }
];

export default function Community({ t, speakFeedback }) {
  const [hasCertificate, setHasCertificate] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [supportTypes, setSupportTypes] = useState({
    Financial: false,
    Education: false,
    Assistive: false
  });
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSupportCheckbox = (type) => {
    setSupportTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const checkEligibility = (e) => {
    e.preventDefault();
    if (hasCertificate === 'No') {
      speakFeedback("A disability certificate is required for most schemes. We suggest getting a UDID card first.");
      setEligibleSchemes([{ name: "UDID Card (Unique Disability ID)", type: "General", desc: "Required to register and get disabled benefits." }]);
      setShowResults(true);
      return;
    }

    let results = [...GLOBAL_SCHEMES];
    if (selectedState && STATE_SCHEMES[selectedState]) {
      results = [...results, ...STATE_SCHEMES[selectedState]];
    }

    const activeFilters = Object.keys(supportTypes).filter(k => supportTypes[k]);
    if (activeFilters.length > 0) {
      results = results.filter(scheme => activeFilters.includes(scheme.type) || scheme.type === 'General');
    }

    setEligibleSchemes(results);
    setShowResults(true);
    speakFeedback(`Found ${results.length} eligible schemes for you.`);
  };

  const filteredNGOs = NGO_DIRECTORY.filter(ngo => 
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="community-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      
      {/* Eligibility Checker */}
      <div className="panel-card" style={{ padding: '24px', border: '3px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', fontWeight: '800' }}>Welfare Eligibility Checker</h2>
        <form onSubmit={checkEligibility} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Q1: Do you have a disability certificate?</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="radio" name="certificate" value="Yes" checked={hasCertificate === 'Yes'} onChange={() => setHasCertificate('Yes')} required />
                Yes
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="radio" name="certificate" value="No" checked={hasCertificate === 'No'} onChange={() => setHasCertificate('No')} />
                No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Q2: Which state do you live in?</label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} style={{ width: '100%', maxWidth: '300px', padding: '8px', borderRadius: '6px', border: '2px solid var(--border)' }} required>
              <option value="">Select State</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Q3: What type of support do you need?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" checked={supportTypes.Financial} onChange={() => handleSupportCheckbox('Financial')} />
                Financial Assistance
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" checked={supportTypes.Education} onChange={() => handleSupportCheckbox('Education')} />
                Education Scholarships
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" checked={supportTypes.Assistive} onChange={() => handleSupportCheckbox('Assistive')} />
                Assistive Devices
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: 'max-content', minHeight: '44px', padding: '10px 24px', alignSelf: 'flex-start' }}>
            Check eligible schemes
          </button>
        </form>

        {showResults && (
          <div style={{ marginTop: '24px', borderTop: '2px solid var(--border)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Your Eligible Schemes:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {eligibleSchemes.map((scheme, idx) => (
                <div key={idx} style={{ padding: '16px', border: '2px solid var(--border)', borderRadius: '8px', background: 'var(--surface-alt)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontWeight: '700' }}>{scheme.name}</h4>
                    <span className="tag" style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{scheme.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)' }}>{scheme.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Directory Section */}
      <div className="panel-card" style={{ padding: '24px', border: '3px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', fontWeight: '800' }}>NGO &amp; Helpline Directory</h2>
        <p style={{ color: '#4A4A4A', fontSize: '0.9rem', marginBottom: '16px' }}>Search and find disability support organizations across major states.</p>
        
        <input 
          type="text" 
          placeholder="Search by state, name or support type..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: '8px', marginBottom: '16px' }}
        />

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
          <thead>
            <tr style={{ borderBottom: '2.5px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px', fontWeight: '700' }}>NGO Name</th>
              <th style={{ padding: '12px 8px', fontWeight: '700' }}>Helpline</th>
              <th style={{ padding: '12px 8px', fontWeight: '700' }}>State</th>
            </tr>
          </thead>
          <tbody>
            {filteredNGOs.map((ngo, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '12px 8px', fontWeight: '700' }}>{ngo.name}</td>
                <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: '700' }}>
                  <a href={`tel:${ngo.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{ngo.phone}</a>
                </td>
                <td style={{ padding: '12px 8px' }}>{ngo.state}</td>
              </tr>
            ))}
            {filteredNGOs.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: '20px 8px', textAlign: 'center', color: '#999' }}>No results match your search criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
