'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type ScanHistory = {
  id: number;
  scan_type: string;
  input_content: string;
  risk_level: string;
  status: string;
  recommendation: string;
  created_at: string;
};

export default function Home() {
  const [urlInput, setUrlInput] = useState('');
  const [urlResult, setUrlResult] = useState<any>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [emailResult, setEmailResult] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // =========================
  // CHECK LOGIN
  // =========================
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      setAuthLoading(false);
    };

    checkUser();
  }, []);

  const fetchHistory = async () => {
  try {
    setHistoryLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.log('NO SESSION FOUND');
      setHistory([]);
      return;
    }

    const res = await fetch('/api/history', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();

    console.log('HISTORY API RESPONSE:', data);

    if (!res.ok) {
      console.log('HISTORY API ERROR:', data);
      setHistory([]);
      return;
    }

    setHistory(data.history || []);
  } catch (error) {
    console.log('HISTORY FETCH ERROR:', error);
    setHistory([]);
  } finally {
    setHistoryLoading(false);
  }
};
  useEffect(() => {
    if (!authLoading) {
      fetchHistory();
    }
  }, [authLoading]);

  // =========================
  // URL SCAN
  // =========================
  const handleUrlScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!urlInput.trim()) return;

    setUrlLoading(true);
    setUrlResult(null);

    try {
      const res = await fetch('/api/scan-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput,
        }),
      });

      const data = await res.json();

      setUrlResult(data);

      await fetchHistory();
    } catch (error) {
      console.log('URL scan error:', error);

      setUrlResult({
        riskLevel: 'ERROR',
        status: 'Failed to scan URL',
        recommendation: 'Check server connection.',
      });
    } finally {
      setUrlLoading(false);
    }
  };

  // =========================
  // EMAIL SCAN
  // =========================
  const handleEmailScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput.trim()) return;

    setEmailLoading(true);
    setEmailResult(null);

    try {
      const res = await fetch('/api/scan-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailText: emailInput,
        }),
      });

      const data = await res.json();

      setEmailResult(data);

      await fetchHistory();
    } catch (error) {
      console.log('Email scan error:', error);

      setEmailResult({
        riskLevel: 'ERROR',
        status: 'Failed to scan email',
        recommendation: 'Check server connection.',
      });
    } finally {
      setEmailLoading(false);
    }
  };

  // =========================
  // DASHBOARD STATISTICS
  // =========================
  const totalScans = history.length;

  const safeScans = history.filter(
    (item) => item.risk_level === 'LOW'
  ).length;

  const highRiskScans = history.filter(
    (item) => item.risk_level === 'HIGH'
  ).length;

  const urlScans = history.filter(
    (item) => item.scan_type === 'url'
  ).length;

  const emailScans = history.filter(
    (item) => item.scan_type === 'email'
  ).length;

  // =========================
  // LOADING SCREEN
  // =========================
  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Checking login...</p>
      </main>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">

      {/* TOP BAR */}
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-6">

  <Link
    href="/offboarding"
    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2 rounded-lg transition"
  >
    👤 Employee Offboarding
  </Link>

  <button
    onClick={handleLogout}
    className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-lg transition"
  >
    Logout
  </button>

</div>

      {/* HEADER */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-400 mb-3">
          AI Phishing Detection Platform
        </h1>

        <p className="text-slate-400">
          Analyze links and email content to identify potential security
          threats instantly.
        </p>
      </div>

      {/* ========================= */}
      {/* DASHBOARD STATISTICS */}
      {/* ========================= */}

      <div className="max-w-5xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-blue-300 mb-5">
          Dashboard Statistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* TOTAL */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">
              Total Scans
            </p>

            <p className="text-3xl font-bold text-white mt-2">
              {totalScans}
            </p>
          </div>

          {/* SAFE */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">
              Safe Scans
            </p>

            <p className="text-3xl font-bold text-green-400 mt-2">
              {safeScans}
            </p>
          </div>

          {/* HIGH RISK */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">
              High Risk
            </p>

            <p className="text-3xl font-bold text-red-400 mt-2">
              {highRiskScans}
            </p>
          </div>

          {/* URL */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">
              URL Scans
            </p>

            <p className="text-3xl font-bold text-blue-400 mt-2">
              {urlScans}
            </p>
          </div>

          {/* EMAIL */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">
              Email Scans
            </p>

            <p className="text-3xl font-bold text-purple-400 mt-2">
              {emailScans}
            </p>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">

        {/* ========================= */}
        {/* URL SCANNER */}
        {/* ========================= */}

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">

          <h2 className="text-xl font-semibold text-blue-300 mb-4">
            1. URL Phishing Detector
          </h2>

          <form
            onSubmit={handleUrlScan}
            className="flex flex-col gap-4"
          >

            <label className="text-sm font-medium text-slate-300">
              Enter Website URL to Check:
            </label>

            <div className="flex flex-col sm:flex-row gap-2">

              <input
                type="text"
                placeholder="e.g. http://secure-paypal-login-free.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={urlLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                {urlLoading ? 'Scanning...' : 'Scan URL'}
              </button>

            </div>
          </form>

          {/* URL RESULT */}
          {urlResult && (
            <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700">

              <h3 className="text-lg font-semibold text-slate-200 mb-3">
                Analysis Result:
              </h3>

              <div className="flex justify-between items-center mb-3">

                <span className="text-slate-400">
                  Risk Level:
                </span>

                <span
                  className={`font-bold px-3 py-1 rounded text-sm ${
                    urlResult.riskLevel === 'HIGH'
                      ? 'bg-red-900 text-red-300'
                      : urlResult.riskLevel === 'ERROR'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-green-900 text-green-300'
                  }`}
                >
                  {urlResult.riskLevel}
                </span>

              </div>

              <p className="text-sm text-slate-300 mb-2">
                <strong>Status:</strong>{' '}
                {urlResult.status}
              </p>

              <p className="text-sm text-slate-300">
                <strong>Recommendation:</strong>{' '}
                {urlResult.recommendation}
              </p>

            </div>
          )}

        </div>

        {/* ========================= */}
        {/* EMAIL SCANNER */}
        {/* ========================= */}

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">

          <h2 className="text-xl font-semibold text-blue-300 mb-4">
            2. Email Phishing Analyzer
          </h2>

          <form
            onSubmit={handleEmailScan}
            className="flex flex-col gap-4"
          >

            <label className="text-sm font-medium text-slate-300">
              Paste Email Content / Body:
            </label>

            <textarea
              rows={5}
              placeholder="e.g. Urgent! Verify your bank account password immediately..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 resize-none"
            />

            <button
              type="submit"
              disabled={emailLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 self-end"
            >
              {emailLoading ? 'Analyzing...' : 'Scan Email'}
            </button>

          </form>

          {/* EMAIL RESULT */}
          {emailResult && (
            <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700">

              <h3 className="text-lg font-semibold text-slate-200 mb-3">
                Analysis Result:
              </h3>

              <div className="flex justify-between items-center mb-3">

                <span className="text-slate-400">
                  Risk Level:
                </span>

                <span
                  className={`font-bold px-3 py-1 rounded text-sm ${
                    emailResult.riskLevel === 'HIGH'
                      ? 'bg-red-900 text-red-300'
                      : emailResult.riskLevel === 'ERROR'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-green-900 text-green-300'
                  }`}
                >
                  {emailResult.riskLevel}
                </span>

              </div>

              <p className="text-sm text-slate-300 mb-2">
                <strong>Status:</strong>{' '}
                {emailResult.status}
              </p>

              <p className="text-sm text-slate-300">
                <strong>Recommendation:</strong>{' '}
                {emailResult.recommendation}
              </p>

            </div>
          )}

        </div>

        {/* ========================= */}
        {/* SCAN HISTORY */}
        {/* ========================= */}

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">

          <h2 className="text-xl font-semibold text-blue-300 mb-4">
            3. Scan History Dashboard
          </h2>

          {historyLoading ? (
            <p className="text-slate-400 text-sm">
              Loading history...
            </p>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No scan history found yet.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm text-slate-300">

                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Content</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-700">

                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-700"
                    >

                      <td className="p-3 uppercase font-semibold text-blue-400">
                        {item.scan_type}
                      </td>

                      <td
                        className="p-3 truncate max-w-xs"
                        title={item.input_content}
                      >
                        {item.input_content}
                      </td>

                      <td className="p-3">

                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            item.risk_level === 'HIGH'
                              ? 'bg-red-900 text-red-300'
                              : 'bg-green-900 text-green-300'
                          }`}
                        >
                          {item.risk_level}
                        </span>

                      </td>

                      <td className="p-3 text-slate-400 text-xs">
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString()
                          : '-'}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}