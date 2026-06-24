'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MedicalHistoryPage() {
  const [activeTab, setActiveTab] = useState('vaccinations');

  const vaccinations = [
    {
      name: 'Rabies (1-Year)',
      administered: 'Oct 12, 2023',
      next: 'Oct 12, 2024',
      daysLeft: 302,
      status: 'active'
    },
    {
      name: 'Bordetella Oral',
      administered: 'Mar 05, 2024',
      next: 'Sep 05, 2024',
      daysLeft: 14,
      status: 'due_soon'
    },
    {
      name: 'DHPP Combo',
      administered: 'Jun 10, 2023',
      next: 'Completed Series',
      status: 'history'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--brown-900)' }}>Medical History</h1>
            <p className="text-sm text-gray-600">Manage vaccinations and clinic visits for <span className="font-semibold text-brown-700">Cooper</span>.</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
      </header>

      {/* Tabs */}
      <div className="bg-white px-4 pt-4">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('vaccinations')}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'vaccinations'
                ? 'text-orange-600'
                : 'text-gray-600'
            }`}
          >
            Vaccinations
            {activeTab === 'vaccinations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('clinics')}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'clinics'
                ? 'text-orange-600'
                : 'text-gray-600'
            }`}
          >
            Clinics
            {activeTab === 'clinics' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('meds')}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'meds'
                ? 'text-orange-600'
                : 'text-gray-600'
            }`}
          >
            Meds
            {activeTab === 'meds' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Health Status Card */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-2xl border-2 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Health Status</h3>
            <p className="text-sm text-gray-600">8/8 records verified</p>
          </div>
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            UP TO DATE
          </span>
        </div>
      </div>

      {/* Export Button */}
      <div className="mx-4 mt-4">
        <button className="w-full bg-brown-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Pet Passport (PDF)
        </button>
      </div>

      {/* Vaccinations List */}
      {activeTab === 'vaccinations' && (
        <div className="mx-4 mt-6 space-y-4">
          {vaccinations.map((vac, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 border">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{vac.name}</h3>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  vac.status === 'active' ? 'bg-green-100 text-green-700' :
                  vac.status === 'due_soon' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {vac.status === 'active' ? 'ACTIVE' :
                   vac.status === 'due_soon' ? 'DUE SOON' : 'HISTORY'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📅</span>
                  <span>Administered: {vac.administered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className={vac.status === 'due_soon' ? 'font-bold text-orange-600' : 'text-gray-600'}>
                    Next: {vac.next}
                  </span>
                  {vac.daysLeft && (
                    <span className={`ml-auto font-bold ${
                      vac.status === 'due_soon' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {vac.daysLeft} days left
                    </span>
                  )}
                </div>
              </div>
              {vac.status === 'history' && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Completed Series</span>
                  <button className="ml-auto text-brown-700 font-semibold">View Certificate</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'clinics' && (
        <div className="mx-4 mt-6">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="font-bold text-lg mb-2">No Clinic Visits Yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Record your pet's clinic visits and appointments here.
            </p>
            <button className="bg-brown-700 text-white px-6 py-3 rounded-xl font-semibold">
              Add Clinic Visit
            </button>
          </div>
        </div>
      )}

      {activeTab === 'meds' && (
        <div className="mx-4 mt-6">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="font-bold text-lg mb-2">No Medications</h3>
            <p className="text-sm text-gray-600 mb-4">
              Track prescribed medications and supplements here.
            </p>
            <button className="bg-brown-700 text-white px-6 py-3 rounded-xl font-semibold">
              Add Medication
            </button>
          </div>
        </div>
      )}

      {/* Add FAB */}
      <button className="fixed bottom-20 right-6 bg-brown-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

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
