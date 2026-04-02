'use client';

import { useState } from 'react';

export default function DiagnosticsAdmin() {
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function generateToken() {
    if (!secret) { setError('Admin secret required'); return; }
    if (!email && !phone) { setError('Email or phone required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setGeneratedUrl(data.url);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          ISP Diagnostic Tokens
        </h1>
        <p className="text-gray-400 mb-8">Generate a unique link to send via email or SMS. When the user clicks it, their ISP and connection details are detected automatically.</p>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Admin Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              placeholder="Enter admin secret"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone Number (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              placeholder="+1 555-123-4567"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={generateToken}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Diagnostic Link'}
          </button>
        </div>

        {generatedUrl && (
          <div className="mt-6 bg-gray-800/50 border border-green-500/30 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Diagnostic Link Generated:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={generatedUrl}
                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-green-400 text-sm"
              />
              <button
                onClick={copyUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Send this link to the user via email or SMS. When they click it, their ISP and connection will be automatically detected.</p>

            {/* Quick share buttons */}
            <div className="flex gap-2 mt-4">
              {email && (
                <a
                  href={`mailto:${email}?subject=ISP%20Connection%20Diagnostic&body=Click%20this%20link%20to%20run%20a%20quick%20diagnostic%20on%20your%20internet%20connection%3A%0A%0A${encodeURIComponent(generatedUrl)}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition"
                >
                  Send via Email
                </a>
              )}
              {phone && (
                <a
                  href={`sms:${phone}?body=Run%20your%20ISP%20diagnostic%20here%3A%20${encodeURIComponent(generatedUrl)}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-500 transition"
                >
                  Send via SMS
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-gray-400 hover:text-white text-sm">Back to ISP Lookup</a>
          {' | '}
          <a href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</a>
        </div>
      </div>
    </div>
  );
}
