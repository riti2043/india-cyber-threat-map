"use client";

import React, { useState } from 'react';
import NumericKeypad from './NumericKeypad';
import ButtonSelect from './ButtonSelect';
import TextInput from './TextInput';

export type LocationId = 'bank' | 'postoffice' | 'shop' | 'hospital' | 'gov' | 'bus';

const LOCATION_NAMES = {
  bank: 'Bank',
  postoffice: 'Post Office',
  shop: 'Kirana Shop',
  hospital: 'Hospital',
  gov: 'Government Office',
  bus: 'Bus Stand'
};

interface TaskModalProps {
  locationId: LocationId;
  onClose: () => void;
  onComplete: (badge: string) => void;
}

export default function TaskModal({ locationId, onClose, onComplete }: TaskModalProps) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<any>({});

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const Instruction = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 mb-6 text-lg font-medium">
      <span>{text}</span>
      <button
        onClick={() => speak(text)}
        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full"
        title="Read Aloud"
      >
        🔊
      </button>
    </div>
  );

  const renderBank = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Instruction text="Insert your card" />
            <button onClick={() => setStep(1)} className="w-48 h-32 bg-slate-600 rounded flex items-center justify-center border-2 border-dashed mx-auto">
              Tap to Insert Card
            </button>
          </>
        );
      case 1:
        return (
          <>
            <Instruction text="Enter your 4-digit PIN" />
            <NumericKeypad
              value={state.pin || ''}
              onInput={(val) => {
                const newPin = (state.pin || '') + val;
                setState({ ...state, pin: newPin });
                if (newPin.length >= 4) {
                  setTimeout(() => setStep(2), 300);
                }
              }}
              onBackspace={() => setState({ ...state, pin: (state.pin || '').slice(0, -1) })}
            />
          </>
        );
      case 2:
        return (
          <>
            <Instruction text="Choose an amount to withdraw" />
            <ButtonSelect
              options={[
                { id: '500', label: '₹500' },
                { id: '1000', label: '₹1000' },
                { id: '2000', label: '₹2000' },
                { id: '5000', label: '₹5000' },
              ]}
              onSelect={(id, label) => {
                setState({ ...state, amount: label });
                setStep(3);
                onComplete('ATM Ready');
              }}
            />
          </>
        );
      case 3:
        return (
          <>
            <Instruction text={`${state.amount} withdrawn successfully!`} />
            <div className="text-center">
              <span className="text-4xl text-green-500">✓</span>
              <p className="mt-4 font-bold text-yellow-400">Badge Earned: ATM Ready</p>
            </div>
          </>
        );
    }
  };

  const renderPostOffice = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Instruction text="Enter your full name" />
            <TextInput placeholder="Full Name" onConfirm={(val) => { setState({...state, name: val}); setStep(1); }} />
          </>
        );
      case 1:
        return (
          <>
            <Instruction text="Enter your address" />
            <TextInput placeholder="Address" onConfirm={(val) => { setState({...state, address: val}); setStep(2); }} />
          </>
        );
      case 2:
        return (
          <>
            <Instruction text="Enter your phone number" />
            <TextInput placeholder="Phone Number" onConfirm={(val) => { setState({...state, phone: val}); setStep(3); }} />
          </>
        );
      case 3:
        return (
          <>
            <Instruction text="Review your details and submit" />
            <div className="bg-slate-700 p-4 rounded mb-4">
              <p><strong>Name:</strong> {state.name}</p>
              <p><strong>Address:</strong> {state.address}</p>
              <p><strong>Phone:</strong> {state.phone}</p>
            </div>
            <button onClick={() => {
              setStep(4);
              onComplete('Form Filler');
            }} className="w-full p-3 bg-green-600 rounded font-bold">Submit</button>
          </>
        );
      case 4:
        return (
          <>
            <Instruction text="Application submitted. Your reference number is 8823" />
            <div className="text-center">
              <span className="text-4xl text-green-500">✓</span>
              <p className="mt-4 font-bold text-yellow-400">Badge Earned: Form Filler</p>
            </div>
          </>
        );
    }
  };

  const renderShop = () => {
    switch(step) {
      case 0:
        return (
          <>
             <Instruction text="Choose an item to buy" />
             <ButtonSelect
                options={[
                  { id: 'rice', label: 'Rice', price: 50 },
                  { id: 'soap', label: 'Soap', price: 20 },
                  { id: 'milk', label: 'Milk', price: 25 },
                ]}
                onSelect={(id, label) => { setState({...state, item: label}); setStep(1); }}
             />
          </>
        );
      case 1:
        return (
          <>
            <Instruction text="Scan the QR code to pay" />
            <div className="bg-white w-48 h-48 mx-auto flex items-center justify-center mb-4">
                {/* Mock QR */}
                <div className="w-40 h-40 bg-black" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }}></div>
            </div>
            <button onClick={() => setStep(2)} className="w-full p-3 bg-blue-600 rounded font-bold">Scan</button>
          </>
        );
      case 2:
        return (
          <>
            <Instruction text={`Confirm payment for ${state.item}`} />
            <button onClick={() => setStep(3)} className="w-full p-3 bg-green-600 rounded font-bold">Confirm</button>
          </>
        );
      case 3:
        return (
          <>
            <Instruction text="Enter your UPI PIN" />
            <NumericKeypad
              value={state.pin || ''}
              onInput={(val) => {
                const newPin = (state.pin || '') + val;
                setState({ ...state, pin: newPin });
                if (newPin.length >= 4) {
                  setTimeout(() => {
                    setStep(4);
                    onComplete('Payment Ready');
                  }, 300);
                }
              }}
            />
          </>
        );
      case 4:
        return (
          <>
            <Instruction text={`Payment successful. Paid for ${state.item}. Transaction ID 44210`} />
            <div className="text-center">
              <span className="text-4xl text-green-500">✓</span>
              <p className="mt-4 font-bold text-yellow-400">Badge Earned: Payment Ready</p>
            </div>
          </>
        );
    }
  };

  const renderHospital = () => {
     switch(step) {
      case 0:
        return (
          <>
             <Instruction text="Choose a department" />
             <ButtonSelect
                options={[
                  { id: 'gen', label: 'General' },
                  { id: 'eye', label: 'Eye Care' },
                  { id: 'dental', label: 'Dental' },
                  { id: 'ent', label: 'ENT' },
                ]}
                onSelect={(id, label) => { setState({...state, dept: label}); setStep(1); }}
             />
          </>
        );
      case 1:
        return (
          <>
             <Instruction text="Choose an available time" />
             <ButtonSelect
                grid
                options={[
                  { id: 't1', label: '10:00 AM' },
                  { id: 't2', label: '11:30 AM' },
                  { id: 't3', label: '2:00 PM' },
                  { id: 't4', label: '4:00 PM' },
                ]}
                onSelect={(id, label) => { setState({...state, time: label}); setStep(2); }}
             />
          </>
        );
      case 2:
        return (
          <>
            <Instruction text={`Confirm your appointment: ${state.dept} at ${state.time}`} />
            <button onClick={() => {
              setStep(3);
              onComplete('Appointment Booked');
            }} className="w-full p-3 bg-green-600 rounded font-bold">Confirm</button>
          </>
        );
      case 3:
        return (
          <>
            <Instruction text="Appointment booked. Your token number is 12" />
            <div className="text-center">
              <span className="text-6xl font-bold text-blue-400 block mb-4">12</span>
              <p className="mt-4 font-bold text-yellow-400">Badge Earned: Appointment Booked</p>
            </div>
          </>
        );
    }
  };

  const renderGov = () => {
    switch(step) {
      case 0:
        return (
          <>
             <Instruction text="Choose a scheme to apply for" />
             <ButtonSelect
                options={[
                  { id: 's1', label: 'ADIP Scheme' },
                  { id: 's2', label: 'UDID Card' },
                  { id: 's3', label: 'Sugamya Bharat Abhiyan' }
                ]}
                onSelect={(id, label) => { setState({...state, scheme: label}); setStep(1); }}
             />
          </>
        );
      case 1:
        return (
          <>
            <Instruction text="Enter your full name" />
            <TextInput placeholder="Full Name" onConfirm={(val) => { setState({...state, name: val}); setStep(2); }} />
          </>
        );
      case 2:
        return (
          <>
             <Instruction text="Select your disability type" />
             <ButtonSelect
                grid
                options={[
                  { id: 'v', label: 'Visual' },
                  { id: 'h', label: 'Hearing' },
                  { id: 'm', label: 'Motor' },
                  { id: 'o', label: 'Other' },
                ]}
                onSelect={(id, label) => { setState({...state, dis: label}); setStep(3); }}
             />
          </>
        );
      case 3:
        return (
          <>
            <Instruction text="Review your application and submit" />
            <div className="bg-slate-700 p-4 rounded mb-4">
              <p><strong>Scheme:</strong> {state.scheme}</p>
              <p><strong>Name:</strong> {state.name}</p>
              <p><strong>Disability:</strong> {state.dis}</p>
            </div>
            <button onClick={() => {
              setStep(4);
              onComplete('Scheme Applicant');
            }} className="w-full p-3 bg-green-600 rounded font-bold">Submit</button>
          </>
        );
      case 4:
        return (
          <>
            <Instruction text="Application submitted. Your acknowledgment number is 5567" />
            <div className="text-center">
              <span className="text-4xl text-green-500">✓</span>
              <p className="mt-4 font-bold text-yellow-400">Badge Earned: Scheme Applicant</p>
            </div>
          </>
        );
    }
  };

  const renderBus = () => {
    switch(step) {
      case 0:
        return (
          <>
             <Instruction text="Choose your destination" />
             <ButtonSelect
                grid
                options={[
                  { id: 'd1', label: 'City Center' },
                  { id: 'd2', label: 'Railway Station' },
                  { id: 'd3', label: 'Market' },
                  { id: 'd4', label: 'Airport' },
                ]}
                onSelect={(id, label) => { setState({...state, dest: label}); setStep(1); }}
             />
          </>
        );
      case 1:
        return (
          <>
             <Instruction text="Choose a departure time" />
             <ButtonSelect
                grid
                options={[
                  { id: 't1', label: '9:00 AM' },
                  { id: 't2', label: '10:30 AM' },
                  { id: 't3', label: '12:00 PM' },
                  { id: 't4', label: '3:00 PM' },
                ]}
                onSelect={(id, label) => { setState({...state, time: label}); setStep(2); }}
             />
          </>
        );
      case 2:
        return (
          <>
            <Instruction text={`Confirm payment of ₹30 for your ticket`} />
            <button onClick={() => setStep(3)} className="w-full p-3 bg-green-600 rounded font-bold">Confirm</button>
          </>
        );
      case 3:
        return (
          <>
            <Instruction text="Enter your UPI PIN" />
            <NumericKeypad
              value={state.pin || ''}
              onInput={(val) => {
                const newPin = (state.pin || '') + val;
                setState({ ...state, pin: newPin });
                if (newPin.length >= 4) {
                  setTimeout(() => {
                    setStep(4);
                    onComplete('Ticket Booked');
                  }, 300);
                }
              }}
            />
          </>
        );
      case 4:
        return (
          <>
            <Instruction text={`Ticket booked. ${state.dest} at ${state.time}. Ticket ID 7734`} />
            <div className="bg-white text-black p-4 rounded text-center border-t-4 border-blue-500">
                <p className="text-sm font-bold text-slate-500">DIGITAL TICKET</p>
                <p className="text-xl font-bold mt-2">{state.dest}</p>
                <p className="text-lg">{state.time}</p>
                <p className="text-sm mt-4">ID: 7734</p>
            </div>
            <p className="mt-6 font-bold text-yellow-400 text-center">Badge Earned: Ticket Booked</p>
          </>
        );
    }
  };

  const renderContent = () => {
    switch (locationId) {
      case 'bank': return renderBank();
      case 'postoffice': return renderPostOffice();
      case 'shop': return renderShop();
      case 'hospital': return renderHospital();
      case 'gov': return renderGov();
      case 'bus': return renderBus();
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg w-full max-w-lg shadow-2xl overflow-y-auto max-h-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
        >
          ✕
        </button>
        <h3 className="text-2xl font-bold mb-6 border-b border-slate-700 pb-2 text-blue-300">{LOCATION_NAMES[locationId]}</h3>
        {renderContent()}
      </div>
    </div>
  );
}
