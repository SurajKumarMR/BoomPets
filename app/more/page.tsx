'use client';

import Link from 'next/link';

export default function MorePage() {
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

      {/* Profile Section */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-4xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Sarah Miller</h2>
            <p className="text-gray-600">sarah.miller@email.com</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                ⭐ PRO MEMBER
              </span>
            </div>
          </div>
          <Link href="/profile/edit" className="p-2">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* My Pets */}
      <div className="bg-white mt-4 px-4 py-4">
        <h3 className="font-bold mb-3">My Pets</h3>
        <div className="flex gap-3 overflow-x-auto">
          <div className="flex-shrink-0 w-24 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl mb-2 mx-auto">
              🐕
            </div>
            <p className="font-semibold text-sm">Cooper</p>
            <p className="text-xs text-gray-600">Golden Retriever</p>
          </div>
          <div className="flex-shrink-0 w-24 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl mb-2 mx-auto border-2 border-dashed border-gray-400">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-semibold text-sm text-gray-600">Add Pet</p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="mt-4">
        <div className="px-4 py-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase">Account</h3>
        </div>
        <div className="bg-white">
          <Link href="/subscription" className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xl">👑</span>
              </div>
              <div>
                <p className="font-semibold">Subscription</p>
                <p className="text-sm text-gray-600">Pro - $19/month</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/payment-methods" className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">💳</span>
              </div>
              <p className="font-semibold">Payment Methods</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/notifications" className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl">🔔</span>
              </div>
              <p className="font-semibold">Notifications</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Health & Data */}
      <div className="mt-4">
        <div className="px-4 py-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase">Health & Data</h3>
        </div>
        <div className="bg-white">
          <Link href="/history" className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xl">💉</span>
              </div>
              <p className="font-semibold">Medical Records</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/track/history" className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <p className="font-semibold">Activity & Nutrition Logs</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/export-data" className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xl">📤</span>
              </div>
              <p className="font-semibold">Export Data</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Support */}
      <div className="mt-4">
        <div className="px-4 py-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase">Support</h3>
        </div>
        <div className="bg-white">
          <Link href="/help" className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">❓</span>
              </div>
              <p className="font-semibold">Help Center</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/contact" className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <p className="font-semibold">Contact Us</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/about" className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-xl">ℹ️</span>
              </div>
              <p className="font-semibold">About BoomPets</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Professional */}
      <div className="mx-4 mt-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Are you a professional?</h3>
        <p className="text-sm opacity-90 mb-4">
          Join as a nutritionist or veterinarian and connect with pet owners worldwide.
        </p>
        <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold">
          Join as Professional
        </button>
      </div>

      {/* Logout */}
      <div className="mx-4 mt-6 mb-6">
        <button className="w-full bg-white border-2 border-red-500 text-red-600 py-4 rounded-xl font-semibold hover:bg-red-50">
          Log Out
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
          <Link href="/more" className="flex flex-col items-center" style={{ color: 'var(--brown-700)' }}>
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span className="text-xs font-medium">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
