'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const specialists = [
  {
    id: '1',
    name: 'Dr. Elena Rodriguez',
    specialty: 'Emergency Care',
    experience: 12,
    rating: 4.9,
    reviews: 1200,
    status: 'online',
    nextAvailable: '2:00 PM',
    price: 45,
    avatar: '👩‍⚕️'
  },
  {
    id: '2',
    name: 'Dr. Marcus Chen',
    specialty: 'Nutritional Science Specialist',
    experience: 5,
    rating: 5.0,
    reviews: 860,
    status: 'offline',
    nextAvailable: 'Tomorrow',
    price: 38,
    avatar: '👨‍⚕️'
  },
  {
    id: '3',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Dermatology & Allergy',
    experience: 12,
    rating: 4.8,
    reviews: 2500,
    status: 'online',
    nextAvailable: 'Available now',
    price: 60,
    avatar: '👩‍⚕️'
  }
];

export default function ConsultPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');

  // Filter and search specialists
  const filteredSpecialists = useMemo(() => {
    let filtered = specialists;

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter((s) =>
        s.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    }

    // Search by name or specialty
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.specialty.toLowerCase().includes(query)
      );
    }

    // Sort specialists
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });

    return filtered;
  }, [selectedSpecialty, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <h1 className="text-xl font-bold" style={{ color: 'var(--brown-900)' }}>BoomPets</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </header>

      {/* Emergency Banner */}
      <div className="bg-red-50 mx-4 mt-4 p-4 rounded-2xl border-2 border-red-200">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-bold">Poison Control Center</h3>
        </div>
        <div className="bg-white p-3 rounded-xl">
          <p className="text-sm font-semibold mb-2">Immediate Assistance</p>
          <p className="text-xs text-gray-600 mb-3">Available 24/7 globally</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-600">📞</span>
                <span className="font-semibold">North America</span>
              </div>
              <a href="tel:888-426-4435" className="text-red-600 font-semibold">888-426-4435</a>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-600">📞</span>
                <span className="font-semibold">International</span>
              </div>
              <a href="tel:+441202509000" className="text-red-600 font-semibold">+44 1202 509000</a>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mt-6">
        <h2 className="text-xl font-bold mb-3">Find an Expert</h2>
        <p className="text-gray-600 text-sm mb-4">Connect with certified pet nutritionists.</p>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by specialty or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <svg className="w-5 h-5 absolute right-3 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredSpecialists.length} specialist{filteredSpecialists.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Specialty Filters */}
      <div className="px-4 mt-4">
        <h3 className="font-semibold mb-3">Select Specialty</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSpecialty('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedSpecialty === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All Experts
          </button>
          <button
            onClick={() => setSelectedSpecialty('emergency')}
            className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-1 ${
              selectedSpecialty === 'emergency' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <span>🚨</span> Emergency
          </button>
          <button
            onClick={() => setSelectedSpecialty('nutrition')}
            className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-1 ${
              selectedSpecialty === 'nutrition' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <span>🥗</span> Nutrition
          </button>
          <button
            onClick={() => setSelectedSpecialty('dermatology')}
            className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-1 ${
              selectedSpecialty === 'dermatology' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <span>🩺</span> Dermatology
          </button>
        </div>
      </div>

      {/* Available Specialists */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Available Specialists</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="price">Sort by Price</option>
            <option value="experience">Sort by Experience</option>
          </select>
        </div>

        {filteredSpecialists.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No specialists found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSpecialists.map((specialist) => (
            <div key={specialist.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-3xl">
                    {specialist.avatar}
                  </div>
                  {specialist.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold">{specialist.name}</h4>
                      <p className="text-sm text-gray-600">{specialist.specialty}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          ⭐ {specialist.rating}
                        </span>
                        <span>📅 {specialist.experience} Yrs Exp</span>
                        <span>💬 {specialist.reviews.toLocaleString()} Reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      specialist.status === 'online' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {specialist.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-600">Next at {specialist.nextAvailable}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">FROM:</p>
                  <p className="text-lg font-bold">${specialist.price}/session</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/consult/${specialist.id}/profile`}
                    className="px-4 py-2 border-2 border-brown-700 text-brown-700 rounded-xl font-semibold"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/consult/${specialist.id}/book`}
                    className="px-4 py-2 bg-brown-700 text-white rounded-xl font-semibold"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Join as Nutritionist Banner */}
      <div className="mx-4 mt-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Share your expertise?</h3>
        <p className="text-sm mb-4 opacity-90">
          Join our elite network of nutritionists and help thousands of pets live healthier, longer lives.
        </p>
        <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
          Join as a nutritionist
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
          <Link href="/consult" className="flex flex-col items-center" style={{ color: 'var(--brown-700)' }}>
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            <span className="text-xs font-medium">Consult</span>
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
