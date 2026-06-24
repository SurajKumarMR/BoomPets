'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const posts = [
    {
      id: 1,
      user: { name: 'Sarah & Cooper', avatar: '👤', time: '2 hours ago' },
      type: 'success',
      content: 'Cooper finally hit his target weight! After 3 months on the custom BoomPets plan, he\'s more active than ever. Thanks to the community for the support! 🐕',
      image: '🐕‍🦺',
      likes: 124,
      comments: 18,
      badge: 'SUCCESS'
    },
    {
      id: 2,
      user: { name: 'Pet Chef Leo', avatar: '👨‍🍳', time: '4 hours ago' },
      type: 'recipe',
      content: 'Grain-Free Pumpkin Cookies 🎃',
      description: 'Use organic pureed pumpkin (not pie filling) for best results',
      time: '15m PREP',
      likes: 86,
      comments: 42,
      badge: 'RECIPE'
    },
    {
      id: 3,
      user: { name: 'David W.', avatar: '👤', time: '6 hours ago' },
      type: 'question',
      content: '"Does anyone have recommendations for low-sodium treats for senior Bulldogs?"',
      response: 'Dr. Arlis: "Dehydrated sweet potato slices are a great natural, low-sodium option! Make sure to..."',
      hasResponse: true,
      replies: 12
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </header>

      {/* Share Input */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            👤
          </div>
          <input
            type="text"
            placeholder="Share a success story..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            📷 Photo
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            📖 Recipe
          </button>
          <button className="px-4 py-2 bg-brown-700 text-white rounded-lg text-sm font-semibold ml-auto">
            Post
          </button>
        </div>
      </div>

      {/* Moderation Notice */}
      <div className="bg-green-50 mx-4 mt-4 p-3 rounded-xl border border-green-200 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-green-900">
          <span className="font-semibold">Nutritionist Moderated</span> - All medical tips are verified by our certified veterinary experts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 mt-4 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium ${
              activeFilter === 'all'
                ? 'bg-brown-700 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Feed
          </button>
          <button
            onClick={() => setActiveFilter('recipes')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium ${
              activeFilter === 'recipes'
                ? 'bg-brown-700 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setActiveFilter('tips')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium ${
              activeFilter === 'tips'
                ? 'bg-brown-700 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tips
          </button>
          <button
            onClick={() => setActiveFilter('questions')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium ${
              activeFilter === 'questions'
                ? 'bg-brown-700 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Questions
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 mt-4 space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-xl">
                {post.user.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{post.user.name}</h3>
                  {post.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      post.type === 'success' ? 'bg-green-100 text-green-700' :
                      post.type === 'recipe' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {post.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{post.user.time}</p>
              </div>
              <button className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-900">{post.content}</p>
              {post.description && (
                <p className="text-sm text-gray-600 mt-2">{post.description}</p>
              )}
              {post.time && (
                <div className="mt-2 inline-flex items-center gap-2 bg-cream-100 px-3 py-1 rounded-full">
                  <span className="text-sm text-brown-700 font-medium">{post.time}</span>
                </div>
              )}
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="bg-yellow-50 h-48 flex items-center justify-center text-7xl">
                {post.image}
              </div>
            )}

            {/* Response (for questions) */}
            {post.hasResponse && post.response && (
              <div className="mx-4 mb-3 bg-blue-50 p-3 rounded-xl border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-900">💬 NUTRITIONIST RESPONSE</span>
                </div>
                <p className="text-sm text-blue-900">{post.response}</p>
              </div>
            )}

            {/* Post Actions */}
            <div className="px-4 py-3 border-t flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">{post.comments || post.replies}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 ml-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-6 bg-brown-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs">HOME</span>
          </Link>
          <Link href="/plan" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            </svg>
            <span className="text-xs">MY PLAN</span>
          </Link>
          <Link href="/community" className="flex flex-col items-center" style={{ color: 'var(--brown-700)' }}>
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span className="text-xs font-medium">COMMUNITY</span>
          </Link>
          <Link href="/consult" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            <span className="text-xs">CONSULT</span>
          </Link>
          <Link href="/more" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span className="text-xs">MORE</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
