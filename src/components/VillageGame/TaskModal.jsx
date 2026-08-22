import React, { useState } from 'react';

const s = {
  overlay: { position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' },
  card: { background: '#0f172a', border: '1px solid rgba(0,240,255,0.2)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 0 40px rgba(0,240,255,0.1)' },
  closeBtn: { position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' },
  title: { fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#38bdf8' },
  instruction: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1rem', fontWeight: 600, color: '#fff' },
  speakBtn: { padding: '6px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' },
  badge: { textAlign: 'center', marginTop: '16px' },
  success: { fontSize: '3rem', color: '#22c55e', display: 'block' },
  badgeLabel: { marginTop: '12px', fontWeight: 'bold', color: '#fbbf24', fontSize: '1rem' },
};

const NAMES = {
  bank: '🏦 Bank',
  postoffice: '✉ Post Office',
  shop: '🛒 Kirana Shop',
  hospital: '🏥 Hospital',
  gov: '🏛 Government Office',
  bus: '🚌 Bus Stand',
};

function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

function Instruction({ text }) {
  return (
    <div style={s.instruction}>
      <span>{text}</span>
      <button style={s.speakBtn} onClick={() => speak(text)} title="Read aloud">🔊</button>
    </div>
  );
}

function Success({ badge }) {
  return (
    <div style={s.badge}>
      <span style={s.success}>✓</span>
      <p style={s.badgeLabel}>🏅 Badge Earned: {badge}</p>
    </div>
  );
}

// ─── Bank ────────────────────────────────────────────────────────────────────
function BankTask({ onComplete }) {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  if (step === 0) return (<><Instruction text="Tap to insert your ATM card" /><BigButton onClick={() => setStep(1)}>💳 Insert Card</BigButton></>);
  if (step === 1) return (<><Instruction text="Enter your 4-digit PIN" /><NumPad value={pin} onChange={v => { const n = pin + v; setPin(n); if (n.length >= 4) setTimeout(() => setStep(2), 300); }} onBack={() => setPin(pin.slice(0, -1))} /></>);
  if (step === 2) return (<><Instruction text="Choose an amount to withdraw" /><OptionGrid options={['₹500','₹1000','₹2000','₹5000']} onSelect={() => { setStep(3); onComplete('ATM Ready'); }} /></>);
  return <Success badge="ATM Ready" />;
}

// ─── Post Office ─────────────────────────────────────────────────────────────
function PostOfficeTask({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  if (step === 0) return (<><Instruction text="Enter your full name" /><TextIn placeholder="Full Name" onConfirm={v => { setData({...data,name:v}); setStep(1); }} /></>);
  if (step === 1) return (<><Instruction text="Enter your address" /><TextIn placeholder="Address" onConfirm={v => { setData({...data,addr:v}); setStep(2); }} /></>);
  if (step === 2) return (<><Instruction text="Enter your phone number" /><TextIn placeholder="Phone Number" onConfirm={v => { setData({...data,phone:v}); setStep(3); }} /></>);
  if (step === 3) return (<><Instruction text="Review and submit your form" /><ReviewBox items={[['Name', data.name],['Address', data.addr],['Phone', data.phone]]} /><BigButton color="#16a34a" onClick={() => { setStep(4); onComplete('Form Filler'); }}>Submit Application</BigButton></>);
  return <Success badge="Form Filler" />;
}

// ─── Shop ─────────────────────────────────────────────────────────────────────
function ShopTask({ onComplete }) {
  const [step, setStep] = useState(0);
  const [item, setItem] = useState('');
  const [pin, setPin] = useState('');
  if (step === 0) return (<><Instruction text="Choose an item to buy" /><OptionGrid options={['Rice ₹50','Soap ₹20','Milk ₹25','Oil ₹60']} onSelect={v => { setItem(v); setStep(1); }} /></>);
  if (step === 1) return (<><Instruction text="Scan the QR code to pay" /><QRMock /><BigButton color="#2563eb" onClick={() => setStep(2)}>📷 Scan QR</BigButton></>);
  if (step === 2) return (<><Instruction text={`Confirm payment for ${item}`} /><BigButton color="#16a34a" onClick={() => setStep(3)}>Confirm</BigButton></>);
  if (step === 3) return (<><Instruction text="Enter your UPI PIN" /><NumPad value={pin} onChange={v => { const n = pin + v; setPin(n); if (n.length >= 4) setTimeout(() => { setStep(4); onComplete('Payment Ready'); }, 300); }} onBack={() => setPin(pin.slice(0, -1))} /></>);
  return <Success badge="Payment Ready" />;
}

// ─── Hospital ─────────────────────────────────────────────────────────────────
function HospitalTask({ onComplete }) {
  const [step, setStep] = useState(0);
  const [dept, setDept] = useState('');
  const [time, setTime] = useState('');
  if (step === 0) return (<><Instruction text="Choose a department" /><OptionGrid options={['General','Eye Care','Dental','ENT']} onSelect={v => { setDept(v); setStep(1); }} /></>);
  if (step === 1) return (<><Instruction text="Choose an available slot" /><OptionGrid options={['10:00 AM','11:30 AM','2:00 PM','4:00 PM']} onSelect={v => { setTime(v); setStep(2); }} /></>);
  if (step === 2) return (<><Instruction text={`Confirm: ${dept} at ${time}`} /><BigButton color="#16a34a" onClick={() => { setStep(3); onComplete('Appointment Booked'); }}>Confirm</BigButton></>);
  return (
    <>
      <Instruction text="Appointment booked! Token number is 12" />
      <div style={{ textAlign:'center', fontSize:'4rem', fontWeight:900, color:'#38bdf8', marginBottom:'8px' }}>12</div>
      <Success badge="Appointment Booked" />
    </>
  );
}

// ─── Government Office ─────────────────────────────────────────────────────────
function GovTask({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  if (step === 0) return (<><Instruction text="Choose a scheme to apply for" /><OptionGrid options={['ADIP Scheme','UDID Card','Sugamya Bharat']} onSelect={v => { setData({...data,scheme:v}); setStep(1); }} /></>);
  if (step === 1) return (<><Instruction text="Enter your full name" /><TextIn placeholder="Full Name" onConfirm={v => { setData({...data,name:v}); setStep(2); }} /></>);
  if (step === 2) return (<><Instruction text="Select your disability type" /><OptionGrid options={['Visual','Hearing','Motor','Other']} onSelect={v => { setData({...data,dis:v}); setStep(3); }} /></>);
  if (step === 3) return (<><Instruction text="Review and submit" /><ReviewBox items={[['Scheme',data.scheme],['Name',data.name],['Disability',data.dis]]} /><BigButton color="#16a34a" onClick={() => { setStep(4); onComplete('Scheme Applicant'); }}>Submit Application</BigButton></>);
  return <Success badge="Scheme Applicant" />;
}

// ─── Bus Stand ─────────────────────────────────────────────────────────────────
function BusTask({ onComplete }) {
  const [step, setStep] = useState(0);
  const [dest, setDest] = useState('');
  const [time, setTime] = useState('');
  const [pin, setPin] = useState('');
  if (step === 0) return (<><Instruction text="Choose your destination" /><OptionGrid options={['City Center','Railway Station','Market','Airport']} onSelect={v => { setDest(v); setStep(1); }} /></>);
  if (step === 1) return (<><Instruction text="Choose departure time" /><OptionGrid options={['9:00 AM','10:30 AM','12:00 PM','3:00 PM']} onSelect={v => { setTime(v); setStep(2); }} /></>);
  if (step === 2) return (<><Instruction text="Confirm payment of ₹30 for your ticket" /><BigButton color="#16a34a" onClick={() => setStep(3)}>Confirm ₹30</BigButton></>);
  if (step === 3) return (<><Instruction text="Enter your UPI PIN" /><NumPad value={pin} onChange={v => { const n = pin + v; setPin(n); if (n.length >= 4) setTimeout(() => { setStep(4); onComplete('Ticket Booked'); }, 300); }} onBack={() => setPin(pin.slice(0, -1))} /></>);
  return (
    <>
      <div style={{ background:'#fff', color:'#000', padding:'16px', borderRadius:'8px', textAlign:'center', borderTop:'4px solid #2563eb', marginBottom:'12px' }}>
        <p style={{ fontSize:'0.7rem', color:'#64748b', margin:0 }}>DIGITAL TICKET</p>
        <p style={{ fontSize:'1.2rem', fontWeight:800, margin:'8px 0 4px' }}>{dest}</p>
        <p style={{ margin:0 }}>{time}</p>
        <p style={{ fontSize:'0.75rem', marginTop:'8px', color:'#475569' }}>ID: 7734</p>
      </div>
      <Success badge="Ticket Booked" />
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function BigButton({ onClick, children, color = '#1d4ed8' }) {
  return (
    <button onClick={onClick} style={{ width:'100%', padding:'14px', background:color, border:'none', borderRadius:'8px', color:'#fff', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', marginTop:'8px' }}>
      {children}
    </button>
  );
}

function OptionGrid({ options, onSelect }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'8px' }}>
      {options.map(o => (
        <button key={o} onClick={() => onSelect(o)} style={{ padding:'12px 8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'0.9rem', transition:'background 0.15s' }}
          onMouseEnter={e => e.target.style.background='rgba(56,189,248,0.15)'}
          onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.05)'}
        >{o}</button>
      ))}
    </div>
  );
}

function NumPad({ value, onChange, onBack }) {
  const digits = ['1','2','3','4','5','6','7','8','9','⌫','0','OK'];
  return (
    <div>
      <div style={{ textAlign:'center', letterSpacing:'12px', fontSize:'2rem', marginBottom:'12px', color:'#38bdf8', fontWeight:900 }}>
        {'•'.repeat(Math.min(value.length, 4)).padEnd(4, '○')}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
        {digits.map(d => (
          <button key={d} onClick={() => d === '⌫' ? onBack() : d !== 'OK' ? onChange(d) : null}
            style={{ padding:'14px', background: d === 'OK' ? '#1d4ed8' : 'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#fff', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer' }}
          >{d}</button>
        ))}
      </div>
    </div>
  );
}

function TextIn({ placeholder, onConfirm }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display:'flex', gap:'8px' }}>
      <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && val.trim() && onConfirm(val.trim())}
        style={{ flex:1, padding:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'#fff', fontSize:'0.95rem', outline:'none' }}
      />
      <button onClick={() => val.trim() && onConfirm(val.trim())}
        style={{ padding:'12px 16px', background:'#1d4ed8', border:'none', borderRadius:'8px', color:'#fff', fontWeight:'bold', cursor:'pointer' }}>OK</button>
    </div>
  );
}

function ReviewBox({ items }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'12px', marginBottom:'12px' }}>
      {items.map(([k, v]) => (
        <p key={k} style={{ margin:'4px 0', fontSize:'0.9rem' }}><strong style={{ color:'#94a3b8' }}>{k}:</strong> <span style={{ color:'#fff' }}>{v}</span></p>
      ))}
    </div>
  );
}

function QRMock() {
  return (
    <div style={{ width:'140px', height:'140px', margin:'0 auto 12px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px' }}>
      <div style={{ width:'110px', height:'110px', background:'repeating-linear-gradient(45deg,#000 25%,transparent 25%,transparent 75%,#000 75%,#000),repeating-linear-gradient(45deg,#000 25%,transparent 25%,transparent 75%,#000 75%,#000)', backgroundSize:'12px 12px', backgroundPosition:'0 0,6px 6px' }} />
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function TaskModal({ locationId, onClose, onComplete }) {
  const taskMap = { bank: BankTask, postoffice: PostOfficeTask, shop: ShopTask, hospital: HospitalTask, gov: GovTask, bus: BusTask };
  const Task = taskMap[locationId];
  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.card}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <h3 style={s.title}>{NAMES[locationId]}</h3>
        {Task && <Task onComplete={badge => { onComplete(badge); setTimeout(onClose, 2000); }} />}
      </div>
    </div>
  );
}
