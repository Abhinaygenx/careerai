'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function MeetingsAnalyticsPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Auth Protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch analytics data
  useEffect(() => {
    if (!user) return;
    const fetchAnalytics = async () => {
      setLoadingData(true);
      try {
        const res = await fetch(`/api/meetings/analytics?userId=${user.uid}`, {
          headers: {
            'x-user-id': user.uid,
          },
        });
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (error) {
        console.error('Failed to load meeting analytics:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center font-sans gap-3">
        <div className="w-8 h-8 border-3 border-purple-950 border-t-purple-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  const COLORS = ['#8B7CF7', '#2DD4BF', '#4DA3FF', '#F59E0B', '#10B981', '#FF6B9D'];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex font-sans">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-[#2D2D2D] bg-[#161616] p-6 hidden md:flex flex-col justify-between select-none">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span>🎯</span>
            <span>Career<span className="text-[#C4F82A]">.ai</span></span>
          </Link>

          <nav className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>📊</span> Dashboard Overview
            </Link>
            
            <div className="h-[1px] bg-[#2D2D2D] my-2" />

            <Link href="/ats-checker" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>🎯</span> ATS Checker
            </Link>
            <Link href="/resume-builder" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>📝</span> Resume Builder
            </Link>
            <Link href="/cover-letter" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>✉️</span> Cover Letters
            </Link>
            <Link href="/mock-interview" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>🎤</span> Mock Interviews
            </Link>
            <Link href="/auto-apply" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>🚀</span> Auto Apply
            </Link>
            <Link href="/dashboard/meetings" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>📅</span> Meeting Tracker
            </Link>
          </nav>
        </div>

        <Link href="/pricing" className="py-2.5 text-center bg-[#C4F82A] text-black font-bold rounded-lg text-xs hover:bg-[#aee61f] transition-all">
          ⚡ Upgrade to Pro
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-[#2D2D2D] px-6 py-4 flex justify-between items-center bg-[#161616]">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/meetings" className="text-gray-400 hover:text-white text-xs">
              ◀ Back to Calendar
            </Link>
            <h1 className="text-xl font-bold text-white leading-none">Calendar & Meeting Analytics</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-sm border border-purple-800">
              {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
            <button onClick={handleLogout} className="text-xs px-2.5 py-1.5 border border-[#2D2D2D] rounded hover:bg-white/5 transition-colors cursor-pointer text-gray-300 hover:text-white">
              Logout
            </button>
          </div>
        </header>

        {/* Analytics Body */}
        {loadingData || !data ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm gap-2 bg-[#0F0F0F]">
            <div className="w-6 h-6 border-2 border-purple-950 border-t-purple-400 rounded-full animate-spin" />
            Loading analytics logs...
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6 select-none bg-[#0F0F0F] flex-grow">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium">Busiest Meeting Day</span>
                <span className="text-2xl font-bold text-white mt-1">{data.busiestDay}</span>
                <span className="text-[10px] text-gray-500 font-mono mt-1">Based on meeting count</span>
              </div>

              {/* Card 2 */}
              <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium">Average Meeting Duration</span>
                <span className="text-2xl font-bold text-purple-400 mt-1">{data.avgDuration} min</span>
                <span className="text-[10px] text-gray-500 font-mono mt-1">Target duration: 30 min</span>
              </div>

              {/* Card 3 */}
              <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium">Meeting Time (Month)</span>
                <span className="text-2xl font-bold text-[#C4F82A] mt-1">{data.totalHours} hours</span>
                <span className="text-[10px] text-gray-500 font-mono mt-1">Across all categories</span>
              </div>

              {/* Card 4 */}
              <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium">Focus Protection Score</span>
                <span className="text-2xl font-bold text-teal-400 mt-1">{data.focusScore}%</span>
                <span className="text-[10px] text-teal-500 font-mono mt-1 font-semibold">
                  Saved: {data.focusHoursSaved} hours this week
                </span>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
              {/* Bar Chart: Meetings per day this week */}
              <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  📅 Weekly Workload (Meetings Per Day)
                </h3>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.weeklyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                      <YAxis stroke="#6B7280" fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#1c1c1c', borderColor: '#2D2D2D', borderRadius: '8px' }}
                        itemStyle={{ color: '#8B7CF7', fontSize: '12px' }}
                        labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="meetings" fill="#8B7CF7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart: Meeting types breakdown */}
              <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  📊 Meeting Type Distribution
                </h3>
                <div className="w-full h-80 flex flex-col sm:flex-row items-center justify-center">
                  <div className="w-full sm:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.typeBreakdown.filter((item: any) => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.typeBreakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#1c1c1c', borderColor: '#2D2D2D', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legend */}
                  <div className="flex flex-col gap-2.5 sm:w-1/2">
                    {data.typeBreakdown.map((entry: any, index: number) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-300 font-medium truncate w-24">{entry.name}</span>
                        <span className="text-gray-500 font-mono font-bold">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Panel: Focus Time analysis */}
            <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                🛡️ Focus Time Guard Report
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                By guarding your 9:00 AM - 12:00 PM deep work hours, you have protected <strong className="text-white font-bold">{data.focusHoursSaved} hours</strong> of developer time this week. This is an increase compared to past schedules, raising your weekly focus metric. Keep up the high flow rate!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="flex-1 bg-[#1c1c1c] border border-white/5 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Focus Time Blocked</span>
                  <span className="text-sm font-bold text-red-400 font-mono">{15 - data.focusHoursSaved} hours</span>
                </div>
                <div className="flex-1 bg-[#1c1c1c] border border-white/5 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Focus Hours Kept Meeting-Free</span>
                  <span className="text-sm font-bold text-green-400 font-mono">{data.focusHoursSaved} / 15 hours</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
