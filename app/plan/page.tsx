'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyPlanPage() {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState(12);

  const weekDays = [
    { day: 'MON', date: 11 },
    { day: 'TUE', date: 12, active: true },
    { day: 'WED', date: 13 },
    { day: 'THU', date: 14 },
    { day: 'FRI', date: 15 },
    { day: 'SAT', date: 16 },
  ];

  const shoppingList = [
    { name: 'Atlantic Salmon Fillets', amount: '1.2 kg', checked: false },
    { name: 'Organic Sweet Potatoes', amount: '2.0 kg', checked: true },
    { name: 'Frozen Garden Peas', amount: '500g', checked: false },
    { name: 'Kelp Supplement', amount: '1 unit', checked: false },
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

      {/* Week Schedule */}
      <div className="bg-white px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Weekly Schedule</h2>
          <span className="text-sm text-gray-600">September 2024</span>
        </div>
        <div className="flex justify-between gap-2">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-colors ${
                day.active
                  ? 'bg-brown-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xs font-medium mb-1">{day.day}</span>
              <span className="text-lg font-bold">{day.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nutritionist Card */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-2xl">
            👩‍⚕️
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Dr. Riya Mehta</h3>
            <p className="text-sm text-gray-600">Emergency Senior Nutritionist</p>
          </div>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            ONLINE NOW
          </span>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-900">
            "Your pet's activity level has increased this week. I've adjusted the protein intake by 5% to support muscle recovery. Keep up the great work!"
          </p>
        </div>
      </div>

      {/* Today's Special */}
      <div className="mx-4 mt-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl overflow-hidden">
          <div className="p-4 text-white">
            <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
              TODAY'S SPECIAL
            </span>
          </div>
          <div className="relative h-48 bg-white">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              🐟🥔🟢
            </div>
          </div>
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold mb-2">Atlantic Salmon & Spring Greens</h3>
            <div className="flex gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                ⏱️ 15 mins
              </span>
              <span className="flex items-center gap-1">
                🔥 High Protein
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">PROTEIN</p>
                <p className="text-lg font-bold">32g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">FATS</p>
                <p className="text-lg font-bold">18g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">CALORIES</p>
                <p className="text-lg font-bold">420</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-gray-600 mb-2">INGREDIENTS</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Fresh Salmon (150g)
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Sweet Potato (80g)
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Peas (35g)
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Olive Oil (8ml)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Shopping List */}
      <div className="mx-4 mt-6 bg-white rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Weekly Shopping List</h3>
          <button className="text-brown-700 text-sm font-semibold flex items-center gap-1">
            📤 EXPORT
          </button>
        </div>
        <div className="space-y-3">
          {shoppingList.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={item.checked}
                className="w-5 h-5 rounded border-2 border-gray-300 text-brown-700 focus:ring-brown-700"
              />
              <div className="flex-1">
                <p className={`font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {item.name}
                </p>
              </div>
              <span className="text-sm text-gray-600">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portion Calculator */}
      <div className="mx-4 mt-4 bg-brown-700 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔢</span>
          <h3 className="font-bold">Portion Calculator</h3>
        </div>
        <p className="text-sm opacity-90 mb-4">
          Adjust meals based on today's extra activity.
        </p>
        <div className="bg-brown-800 rounded-xl p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">ACTIVITY LEVEL</span>
            <span className="text-xs">MODERATE (+10%)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="60"
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.3)' }}
          />
        </div>
        <div className="bg-brown-800 rounded-xl p-3">
          <p className="text-xs font-semibold mb-1">RECOMMENDED PORTION</p>
          <p className="text-3xl font-bold">210g</p>
        </div>
        <button className="w-full mt-3 bg-white text-brown-900 py-3 rounded-xl font-semibold">
          LOG MEAL
        </button>
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
          <Link href="/plan" className="flex flex-col items-center" style={{ color: 'var(--brown-700)' }}>
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            </svg>
            <span className="text-xs font-medium">My Plan</span>
          </Link>
          <Link href="/track" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="text-xs">Track</span>
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
