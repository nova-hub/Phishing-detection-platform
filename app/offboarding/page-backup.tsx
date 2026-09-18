'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function OffboardingPage() {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState('');
  const [reason, setReason] = useState('');

  const [accountDisabled, setAccountDisabled] = useState(false);
  const [emailAccessRevoked, setEmailAccessRevoked] = useState(false);
  const [systemAccessRevoked, setSystemAccessRevoked] = useState(false);
  const [apiKeysRevoked, setApiKeysRevoked] = useState(false);
  const [assetsReturned, setAssetsReturned] = useState(false);
  const [securityReviewCompleted, setSecurityReviewCompleted] = useState(false);

  const [additionalNotes, setAdditionalNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/offboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName,
          employeeEmail,
          lastWorkingDate,
          reason,
          accountDisabled,
          emailAccessRevoked,
          systemAccessRevoked,
          apiKeysRevoked,
          assetsReturned,
          securityReviewCompleted,
          additionalNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit offboarding form.');
        return;
      }

      setMessage('Offboarding record submitted successfully.');

      setEmployeeName('');
      setEmployeeEmail('');
      setLastWorkingDate('');
      setReason('');
      setAccountDisabled(false);
      setEmailAccessRevoked(false);
      setSystemAccessRevoked(false);
      setApiKeysRevoked(false);
      setAssetsReturned(false);
      setSecurityReviewCompleted(false);
      setAdditionalNotes('');
    } catch (err) {
      console.log(err);
      setError('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-8">

      {/* TOP BAR */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">

        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg"
        >
          ← Dashboard
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-8">

        <h1 className="text-4xl font-bold text-blue-400 mb-3">
          Security Offboarding
        </h1>

        <p className="text-slate-400">
          Securely manage employee access and security activities during offboarding.
        </p>

      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 md:p-8 shadow-lg"
      >

        {/* EMPLOYEE DETAILS */}
        <h2 className="text-xl font-semibold text-blue-300 mb-5">
          Employee Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Employee Name
            </label>

            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Employee Email
            </label>

            <input
              type="email"
              value={employeeEmail}
              onChange={(e) => setEmployeeEmail(e.target.value)}
              placeholder="employee@example.com"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Last Working Date
            </label>

            <input
              type="date"
              value={lastWorkingDate}
              onChange={(e) => setLastWorkingDate(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Offboarding Reason
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select reason</option>
              <option value="Resignation">Resignation</option>
              <option value="Termination">Termination</option>
              <option value="Contract End">Contract End</option>
              <option value="Transfer">Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

        </div>

        {/* SECURITY CHECKLIST */}
        <h2 className="text-xl font-semibold text-blue-300 mt-10 mb-5">
          Security Offboarding Checklist
        </h2>

        <div className="space-y-4">

          <label className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={accountDisabled}
              onChange={(e) => setAccountDisabled(e.target.checked)}
              className="w-5 h-5"
            />

            <span>
              User account disabled
            </span>
          </label>

          <label className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAccessRevoked}
              onChange={(e) => setEmailAccessRevoked(e.target.checked)}
              className="w-5 h-5"
            />

            <span>
              Email access revoked
            </span>
          </label>

          <label className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={systemAccessRevoked}
              onChange={(e) => setSystemAccessRevoked(e.target.checked)}
              className="w-5 h-5"
            />

            <span>
              System/application access revoked
            </span>
          </label>

          <label className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={apiKeysRevoked}
              onChange={(e) => setApiKeysRevoked(e.target.checked)}
              className="w-5 h-5"
            />

            <span>
              API keys and tokens revoked
            </span>
          </label>

          <label className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={assetsReturned}
              onChange={(e) => setAssetsReturned(e.target.checked)}
              className="w-5 h-5"
            />

            <span>
              Company devices/assets returned
            </span>
          </label>

          <label className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={securityReviewCompleted}
              onChange={(e) => setSecurityReviewCompleted(e.target.checked)}
              className="w-5 h-5"
            />

            <span>
              Final security review completed
            </span>
          </label>

        </div>

        {/* NOTES */}
        <div className="mt-8">

          <label className="block text-sm text-slate-300 mb-2">
            Additional Notes
          </label>

          <textarea
            rows={5}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Enter additional security/offboarding notes..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 resize-none"
          />

        </div>

        {/* SUCCESS */}
        {message && (
          <div className="mt-6 bg-green-900/50 border border-green-700 text-green-300 rounded-lg p-4">
            {message}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Submitting...' : 'Submit Offboarding'}
        </button>

      </form>

    </main>
  );
}