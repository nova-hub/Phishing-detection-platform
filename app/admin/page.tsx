'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Scan = {
  id: number;
  scan_type: string;
  input_content: string;
  risk_level: string;
  status: string;
  created_at: string;
};

type User = {
  id: string;
  email?: string;
  created_at: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Scan history
      const { data: scanData } = await supabase
        .from('scan_history')
        .select('*')
        .order('created_at', { ascending: false });

      setScans(scanData || []);

      // Auth users cannot be directly read from the browser.
      // We will add proper user management API later.
      setUsers([]);
    } catch (error) {
      console.error('Admin check error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg">Loading Admin Panel...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">🚫</div>

          <h1 className="text-2xl font-bold mb-2">
            Access Denied
          </h1>

          <p className="text-slate-400 mb-6">
            You do not have permission to access the Admin Panel.
          </p>

          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-lg font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const totalScans = scans.length;

  const safeScans = scans.filter(
    (scan) => scan.risk_level === 'LOW'
  ).length;

  const highRiskScans = scans.filter(
    (scan) => scan.risk_level === 'HIGH'
  ).length;

  const urlScans = scans.filter(
    (scan) => scan.scan_type === 'url'
  ).length;

  const emailScans = scans.filter(
    (scan) => scan.scan_type === 'email'
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      {/* TOP BAR */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">

        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="text-slate-300 hover:text-white font-semibold"
        >
          ← Main Dashboard
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>

      </div>

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">

        <p className="text-purple-400 font-semibold mb-2">
          SECURITY PLATFORM
        </p>

        <h1 className="text-4xl font-bold">
          🛡️ Admin Panel
        </h1>

        <p className="text-slate-400 mt-2">
          Monitor phishing detection activity and platform security.
        </p>

      </div>

      {/* STATISTICS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400">Total Scans</p>
          <p className="text-3xl font-bold mt-2">
            {totalScans}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400">Safe Scans</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {safeScans}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400">High Risk</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            {highRiskScans}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400">URL Scans</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {urlScans}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400">Email Scans</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {emailScans}
          </p>
        </div>

      </div>

      {/* SCAN ACTIVITY */}
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-4">

          <div>
            <h2 className="text-2xl font-bold">
              Recent Scan Activity
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Latest phishing detection activity
            </p>
          </div>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

          {scans.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No scan activity found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Content</th>
                    <th className="px-5 py-4">Risk</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Time</th>
                  </tr>
                </thead>

                <tbody>

                  {scans.slice(0, 20).map((scan) => (

                    <tr
                      key={scan.id}
                      className="border-t border-slate-800 hover:bg-slate-800/50"
                    >

                      <td className="px-5 py-4 capitalize">
                        {scan.scan_type}
                      </td>

                      <td className="px-5 py-4 max-w-xs truncate">
                        {scan.input_content}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            scan.risk_level === 'HIGH'
                              ? 'bg-red-500/20 text-red-400'
                              : scan.risk_level === 'MEDIUM'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {scan.risk_level}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {scan.status}
                      </td>

                      <td className="px-5 py-4 text-slate-400 text-sm">
                        {new Date(scan.created_at).toLocaleString()}
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