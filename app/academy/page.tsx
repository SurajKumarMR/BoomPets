'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AcademyPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Advanced Avian Dietetics',
      duration: '12 hours',
      level: 'Intermediate',
      price: 89,
      image: '🦜🥕',
      isBestseller: true,
      category: 'avian'
    },
    {
      id: 2,
      title: 'Essential Feline Wellness',
      duration: '6 hours',
      level: 'Beginner',
      price: 54,
      image: '🐱🥗',
      category: 'feline'
    },
    {
      id: 3,
      title: 'Canine Metabolism 101',
      duration: '24 hours',
      level: 'Advanced',
      price: 120,
      image: '🐕📚',
      category: 'canine'
    }
  ];

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-brown-700 to-brown-900 text-white p-6 mx-4 mt-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-yellow-500 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold">
            ⭐ ACCREDITED EXCELLENCE
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Master Pet Nutrition</h2>
        <p className="text-sm opacity-90 mb-4">
          Level up your skills with courses renowned by global veterinary associations
        </p>
        <button className="bg-white text-brown-900 px-6 py-3 rounded-xl font-semibold">
          View Certifications
        </button>
      </div>

      {/* Category Filters */}
      <div className="px-4 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-brown-700 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            <span>🌐</span> All Species
          </button>
          <button
            onClick={() => setSelectedCategory('canine')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium flex items-center gap-2 ${
              selectedCategory === 'canine'
                ? 'bg-brown-700 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            <span>🐕</span> Canine
          </button>
          <button
            onClick={() => setSelectedCategory('feline')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium flex items-center gap-2 ${
              selectedCategory === 'feline'
                ? 'bg-brown-700 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            <span>🐱</span> Feline
          </button>
          <button
            onClick={() => setSelectedCategory('exotic')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium flex items-center gap-2 ${
              selectedCategory === 'exotic'
                ? 'bg-brown-700 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            <span>🦎</span> Exotic Pets
          </button>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Popular Courses</h2>
          <Link href="/academy/all" className="text-brown-700 text-sm font-semibold">
            See all
          </Link>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Course Image */}
              <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 h-40 flex items-center justify-center text-6xl">
                {course.image}
                {course.isBestseller && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      ⭐ Bestseller
                    </span>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    ⏱️ {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    📊 {course.level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-brown-900">${course.price}</p>
                  </div>
                  <button className="bg-brown-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brown-800 transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vet Pro Tip */}
      <div className="mx-4 mt-6 bg-green-50 rounded-2xl p-4 border-2 border-green-200">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-green-900 mb-1">Vet Pro Tip</h3>
            <p className="text-sm text-green-800">
              Accredited courses count towards your annual Continuing Professional Development (CPD) credits.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Instructor */}
      <div className="mx-4 mt-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-16 h-16 rounded-full bg-purple-400 flex items-center justify-center text-3xl">
            👨‍⚕️
          </div>
          <div>
            <h3 className="font-bold text-lg">Featured Instructor</h3>
            <p className="text-sm opacity-90">Dr. James Peterson, DVM</p>
          </div>
        </div>
        <p className="text-sm opacity-95 mb-4">
          25+ years in veterinary nutrition. Certified by ACVN. Published author of "Modern Pet Dietetics".
        </p>
        <button className="bg-white text-purple-700 px-5 py-2 rounded-xl font-semibold text-sm">
          View Courses
        </button>
      </div>

      {/* My Enrollments (if any) */}
      <div className="mx-4 mt-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
        <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-300">
          <span className="text-5xl mb-3 block">📚</span>
          <h3 className="font-bold mb-2">No enrollments yet</h3>
          <p className="text-sm text-gray-600">
            Enroll in a course to start your learning journey
          </p>
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
          <Link href="/academy" className="flex flex-col items-center" style={{ color: 'var(--brown-700)' }}>
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
            <span className="text-xs font-medium">Academy</span>
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
