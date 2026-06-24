'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackPage() {
  const [selectedTime, setSelectedTime] = useState('08:00 AM');
  const [amount, setAmount] = useState('1.5');

  const feedHistory = [
    { type: 'Breakfast', food: 'Premium Kibble', amount: '1.5 Cups', time: 'TODAY, 8:15 AM' },
    { type: 'Dinner', food: 'Fresh Salmon', amount: '1.0 Cups', time: 'YESTERDAY, 6:30 PM' },
    { type: 'Lunch', food: 'Kibble & Topper', amount: '0.5 Cups', time: 'YESTERDAY, 12:45 PM' }
  ];

  const weekDays = [
    { day: 'MON', completed: true },
    { day: 'TUE', completed: true },
    { day: 'WED', completed: true },
    { day: 'THU', completed: true },
    { day: 'FRI', completed: true },
    { day: 'SAT', completed: true },
    { day: 'SUN', completed: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <h1 className="text-xl font-bold" style={{ color: 'var(--brown-900)' }}>BoomPets</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
      </header>

      {/* Feeding Streak */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Feeding Streak</h2>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
            7 DAYS
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">Keep Buddy's routine on track!</p>
        
        <div className="flex justify-between">
          {weekDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                day.completed 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {day.completed && (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-600">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log a Meal */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🍽️</span>
          <h2 className="text-lg font-bold">Log a Meal</h2>
        </div>

        <div className="space-y-4">
          {/* Food Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Food Type</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Premium Kibble (Adult)</option>
              <option>Fresh Salmon</option>
              <option>Chicken & Rice</option>
              <option>Grain-Free Blend</option>
            </select>
          </div>

          {/* Amount and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Amount</label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-3 py-3 focus:outline-none"
                  step="0.1"
                />
                <span className="bg-gray-100 px-3 py-3 text-sm font-medium">CUPS</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Time</label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <input
                  type="text"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex-1 px-3 py-3 focus:outline-none text-center"
                />
                <button className="px-3 py-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={3}
              placeholder="e.g. Added fish oil, Buddy was very hungry"
            />
          </div>

          {/* Complete Button */}
          <button className="w-full bg-brown-700 text-white py-4 rounded-xl font-semibold">
            Complete Log
          </button>
        </div>
      </div>

      {/* Feed History */}
      <div className="mx-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Feed History</h3>
          <Link href="/track/history" className="text-orange-600 text-sm font-semibold">
            VIEW ALL →
          </Link>
        </div>

        <div className="space-y-3">
          {feedHistory.map((entry, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                entry.type === 'Breakfast' ? 'bg-green-100' :
                entry.type === 'Dinner' ? 'bg-orange-100' : 'bg-yellow-100'
              }`}>
                {entry.type === 'Breakfast' ? '🥣' : entry.type === 'Dinner' ? '🍖' : '🥪'}
              </div>
              <div className="flex-1">
                <h4 className="font-bold">{entry.type}</h4>
                <p className="text-sm text-gray-600">{entry.food} • {entry.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mx-4 mt-6 bg-green-50 p-4 rounded-2xl border-2 border-green-200">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-green-900 mb-1">Pro Tip</h4>
            <p className="text-sm text-green-800">
              Consistent feeding times help regulate Buddy's metabolism. Try to keep meals within 30 minutes of his usual schedule!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/plan" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            </svg>
            <span className="text-xs">My Plan</span>
          </Link>
          <Link href="/track" className="flex flex-col items-center" style={{ color: 'var(--brown-700)' }}>
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="text-xs font-medium">Track</span>
          </Link>
          <Link href="/consult" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            <span className="text-xs">Consult</span>
          </Link>
          <Link href="/more" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span className="text-xs">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
