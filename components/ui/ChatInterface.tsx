'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'specialist';
  timestamp: Date;
  senderName: string;
}

interface ChatInterfaceProps {
  consultationId: string;
  specialistName: string;
  onClose?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  consultationId,
  specialistName,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help with your pet\'s consultation. How can I assist you today?',
      sender: 'specialist',
      timestamp: new Date(),
      senderName: specialistName,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      senderName: 'You',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulate specialist typing
    setIsTyping(true);
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. Let me review that information.',
        sender: 'specialist',
        timestamp: new Date(),
        senderName: specialistName,
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
            👨‍⚕️
          </div>
          <div>
            <h3 className="font-semibold">{specialistName}</h3>
            <p className="text-xs text-amber-100">Online</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] ${
                message.sender === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              } rounded-2xl px-4 py-2`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-amber-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
