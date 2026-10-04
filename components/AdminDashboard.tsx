"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Download,
  Gauge,
  LoaderCircle,
  LogOut,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  Users,
  X,
  FileDown,
  UserCheck
} from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { PROBLEMS } from "@/data/site";
import { auth, isFirebaseReady, missingFirebaseKeys } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/access";
import {
  deleteRegistration,
  fetchRegistrations,
  fetchAuditLogs,
  updateRegistrationStatus
} from "@/lib/registrations";
import type { RegistrationRecord, AuditLog } from "@/lib/types";
import OmnitrixMark from "./OmnitrixMark";

type SortKey = "newest" | "team" | "track";

const STATUSES: RegistrationRecord["status"][] = ["registered", "shortlisted", "rejected"];

const STATUS_LABEL: Record<RegistrationRecord["status"], string> = {
  registered: "Registered",
  shortlisted: "Shortlisted",
  rejected: "Rejected"
};

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Stable empty references, so `data?.records ?? EMPTY` keeps its identity. */
const NO_RECORDS: RegistrationRecord[] = [];
const NO_AUDIT_LOGS: AuditLog[] = [];

/** One round trip for everything the dashboard shows. No state, no side effects. */
async function readDashboard() {
  const [records, auditLogs] = await Promise.all([
    fetchRegistrations(),
    fetchAuditLogs()
  ]);
  return { records, auditLogs };
}

export default function AdminDashboard() {
  /* `undefined` = the auth listener has not answered yet, `null` = signed out. */
  const [user, setUser] = useState<{ email: string | null } | null | undefined>(undefined);
  const [data, setData] = useState<{
    records: RegistrationRecord[];
    auditLogs: AuditLog[];
    key: number;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "shortlisted" | "audit">("all");
  const [selectedTeam, setSelectedTeam] = useState<RegistrationRecord | null>(null);
  /* Bumping this re-runs the load effect — the manual refresh button. */
  const [refreshKey, setRefreshKey] = useState(0);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const refresh = (manual: boolean = false) => {
    if (manual) setIsManualRefresh(true);
    setRefreshKey((key) => key + 1);
  };

  const authReady = isFirebaseReady ? user !== undefined : true;
  const isAdmin = isAdminEmail(user?.email);

  /* Loading is derived, not stored: a fetch is in flight whenever the data
     on hand is missing or was loaded for an older request key. */
  const loading = isAdmin && isManualRefresh && (!data || data.key !== refreshKey);
  const records = data?.records ?? NO_RECORDS;
  const auditLogs = data?.auditLogs ?? NO_AUDIT_LOGS;

  const handleStatusChange = (record: RegistrationRecord, nextStatus: "shortlisted" | "rejected") => {
    const reason = window.prompt(`Enter reason to ${nextStatus} ${record.teamName}:`);
    if (reason === null) return;
    if (reason.trim() === "") {
      window.alert("Reason is required.");
      return;
    }
    const cleanReason = reason.trim();
    
    setData((current) => current ? { 
      ...current, 
      records: current.records.map((r) => r.id === record.id ? { ...r, status: nextStatus, statusReason: cleanReason } : r) 
    } : current);
    
    updateRegistrationStatus(record.id, record.teamName, user!.email!, nextStatus, cleanReason).catch(() => refresh());
  };
  useEffect(() => {
    if (!isFirebaseReady) return undefined;
    return onAuthStateChanged(auth, (next) => {
      setUser(next ? { email: next.email } : null);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;

    readDashboard()
      .then((next) => {
        if (cancelled) return;
        setData({ ...next, key: refreshKey });
        setLoadError(null);
        setIsManualRefresh(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err?.message || "Could not read registrations. Check Firestore security rules.");
        setIsManualRefresh(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, refreshKey]);

  useEffect(() => {
    if (!isAdmin) return undefined;

    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isAdmin]);

  const handleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setAuthError((err as Error)?.message || "Sign-in failed.");
    } finally {
      setSigningIn(false);
    }
  };

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const rows = records.filter((record) => {
      if (activeTab === "shortlisted" && record.status !== "shortlisted") return false;
      if (trackFilter && record.problemId !== trackFilter) return false;
      if (!needle) return true;

      return (
        record.teamName?.toLowerCase().includes(needle) ||
        record.collegeName?.toLowerCase().includes(needle) ||
        record.emailId?.toLowerCase().includes(needle) ||
        record.problemId?.toLowerCase().includes(needle) ||
        record.alien?.toLowerCase().includes(needle) ||
        record.members?.some((member) => member.name?.toLowerCase().includes(needle))
      );
    });

    return rows.sort((a, b) => {
      if (sort === "team") return a.teamName.localeCompare(b.teamName);
      if (sort === "track") return a.problemId.localeCompare(b.problemId);
      return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
    });
  }, [records, search, trackFilter, sort, activeTab]);

  const totals = useMemo(() => {
    const capacity = PROBLEMS.length * 9999;
    return {
      teams: records.length,
      capacity,
      people: records.reduce((sum, record) => sum + (record.teamSize ?? 0), 0),
      shortlisted: records.filter((record) => record.status === "shortlisted").length
    };
  }, [records]);

  const exportCsv = () => {
    const header = [
      "Pass ID",
      "Registered",
      "Team",
      "College",
      "Members",
      "Member details",
      "Contact",
      "Email",
      "Track",
      "Alien",
      "Mission",
      "Abstract",
      "PPT URL",
      "Round",
      "Status",
    ];

    const rows = filtered.map((record) => [
      record.passId,
      record.createdAt?.seconds ? new Date(record.createdAt.seconds * 1000).toISOString() : "",
      record.teamName,
      record.collegeName,
      record.teamSize,
      record.members?.map((member) => member.name).join(", "),
      record.members?.[0]?.phone ?? "",
      record.emailId,
      `${record.problemId} â€” ${record.alien}`,
      record.problemTitle,
      record.abstract,
      record.pptUrl ?? "",
      record.round,
      record.status,
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `biobyte-teams-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportMembersCsv = () => {
    const header = [
      "S_No",
      "Team Name",
      "Student_Name",
      "Student_ID(Reg.No)",
      "Institute Name",
      "Program_Type(UG/PG)",
      "Year",
      "Semester",
      "Enter_Course",
      "Email_ID",
      "Mobile_Number",
      "Residential_address",
      "DOB"
    ];

    let sNo = 1;
    const rows: unknown[][] = [];
    
    filtered.forEach((record) => {
      record.members?.forEach((member) => {
        const isPg = member.course?.toLowerCase().includes("m.") || 
                     member.course?.toLowerCase().includes("master") ||
                     member.course?.toLowerCase().includes("pg");
        
        rows.push([
          sNo++,
          record.teamName,
          member.name,
          member.registrationNo,
          record.collegeName,
          isPg ? "PG" : "UG",
          member.year,
          member.semester,
          member.course,
          member.email,
          member.phone,
          member.address,
          member.dob
        ]);
      });
    });

    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `biobyte-members-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------- gate ---------------- */

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <p className="flex items-center gap-3 text-gray-400 font-medium">
          <LoaderCircle size={20} className="animate-spin text-green-500" /> Linking account...
        </p>
      </div>
    );
  }

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="bg-[#111111] border border-red-900/30 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TriangleAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">System Offline</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Firebase is not configured. Missing: <code className="text-red-400">{missingFirebaseKeys.join(", ")}</code>.
          </p>
          <Link className="inline-flex w-full justify-center px-5 py-3 text-sm font-medium bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors" href="/">
            Return to Site
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Restricted Access</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            {user?.email
              ? `${user.email} is not authorized.`
              : "Please sign in with an administrator account to access the dashboard."}
          </p>

          {authError ? <p className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-900/30">{authError}</p> : null}

          <div className="flex flex-col gap-3">
            {!user ? (
              <button
                type="button"
                className="inline-flex w-full justify-center items-center gap-2 px-5 py-3 text-sm font-semibold bg-green-500 text-black rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50"
                onClick={handleSignIn}
                disabled={signingIn}
              >
                {signingIn ? <LoaderCircle size={18} className="animate-spin" /> : <BadgeCheck size={18} />}
                {signingIn ? "Authenticating..." : "Sign in with Google"}
              </button>
            ) : (
              <button 
                type="button" 
                className="inline-flex w-full justify-center items-center gap-2 px-5 py-3 text-sm font-medium bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors" 
                onClick={() => signOut(auth)}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            )}
            <Link className="inline-flex w-full justify-center items-center gap-2 px-5 py-3 text-sm font-medium text-gray-500 hover:text-white rounded-xl transition-colors mt-2" href="/">
              Return to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- dashboard ---------------- */

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-200 font-sans overflow-hidden selection:bg-green-500/30 selection:text-emerald-200">
      
      {/* ---------------- Sidebar ---------------- */}
      <aside className="hidden lg:flex w-72 bg-[#111111] border-r border-gray-800 flex-col shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-gray-800/50">
          <div className="font-bold text-xl text-white tracking-widest flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black shadow-lg shadow-green-500/20">
              <ShieldAlert size={20} className="fill-black/20" />
            </div>
            BIOBYTE
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-2">
          <button 
            onClick={() => setActiveTab("all")}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === "all" ? "bg-gray-800/40 text-green-400 border border-gray-700/50" : "text-gray-400 hover:text-white hover:bg-gray-800/20 border border-transparent"}`}
          >
            <Users size={18} /> All Registrations
          </button>
          <button 
            onClick={() => setActiveTab("shortlisted")}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === "shortlisted" ? "bg-gray-800/40 text-green-400 border border-gray-700/50" : "text-gray-400 hover:text-white hover:bg-gray-800/20 border border-transparent"}`}
          >
            <BadgeCheck size={18} /> Shortlisted Teams
          </button>
          <button 
            onClick={() => setActiveTab("audit")}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === "audit" ? "bg-gray-800/40 text-green-400 border border-gray-700/50" : "text-gray-400 hover:text-white hover:bg-gray-800/20 border border-transparent"}`}
          >
            <ShieldAlert size={18} /> Audit Logs
          </button>
          <div className="my-4 border-b border-gray-800/50"></div>
          <Link href="/" className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/40 rounded-xl flex items-center gap-3 font-medium transition-all">
            <ArrowLeft size={18} /> Back to Site
          </Link>
        </nav>
        
        <div className="p-5 border-t border-gray-800/50">
          <div className="flex items-center gap-4 bg-[#0a0a0a] p-3 rounded-2xl border border-gray-800">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-200 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <button onClick={() => signOut(auth)} className="text-gray-500 hover:text-white shrink-0 p-2 rounded-lg hover:bg-gray-800 transition-colors" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a] relative">
        
        {/* Topbar */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-xl z-10 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-100">Overview</h1>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Registration Dashboard</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            <button 
              onClick={() => refresh(true)} 
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#111111] hover:bg-gray-800 border border-gray-800 rounded-xl text-sm font-semibold text-gray-300 transition-all shadow-sm shrink-0"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-green-500" : ""} /> 
              <span className="hidden md:inline">Refresh</span>
            </button>
            <button 
              onClick={exportCsv} 
              disabled={!filtered.length}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#111111] hover:bg-gray-800 border border-gray-800 rounded-xl text-sm font-semibold text-gray-300 transition-all shadow-sm disabled:opacity-50 shrink-0"
              title="Export Teams"
            >
              <FileDown size={16} /> 
              <span className="hidden md:inline">Teams</span>
            </button>
            <button 
              onClick={exportMembersCsv} 
              disabled={!filtered.length}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#111111] hover:bg-gray-800 border border-gray-800 rounded-xl text-sm font-semibold text-gray-300 transition-all shadow-sm disabled:opacity-50 shrink-0"
              title="Export Members"
            >
              <UserCheck size={16} /> 
              <span className="hidden md:inline">Members</span>
            </button>
            <button 
              onClick={() => window.print()} 
              disabled={!filtered.length}
              className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-green-500 hover:bg-green-400 rounded-xl text-sm font-bold text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 shrink-0"
              title="Print"
            >
              <Printer size={16} /> 
              <span className="hidden md:inline">Print / PDF</span>
            </button>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
          <div className="max-w-[1600px] mx-auto">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#111111] border border-gray-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users size={64} />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Teams</p>
                <p className="text-5xl font-black text-white tracking-tight">{totals.teams}</p>
                <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">System slots</span>
                  <span className="text-xs text-gray-400 font-bold bg-gray-800 px-2 py-1 rounded-md">{totals.capacity}</span>
                </div>
              </div>

              <div className="bg-[#111111] border border-gray-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                  <BadgeCheck size={64} />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Members</p>
                <p className="text-5xl font-black text-green-400 tracking-tight">{totals.people}</p>
                <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Across all tracks</span>
                  <span className="text-xs text-green-400/50 font-bold bg-green-500/10 px-2 py-1 rounded-md">Live</span>
                </div>
              </div>

              <div className="bg-[#111111] border border-gray-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
                  <ShieldAlert size={64} />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Shortlisted</p>
                <p className="text-5xl font-black text-purple-400 tracking-tight">{totals.shortlisted}</p>
                <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Advanced to R2</span>
                  <span className="text-xs text-purple-400/50 font-bold bg-purple-500/10 px-2 py-1 rounded-md">Action</span>
                </div>
              </div>

              <div className="bg-[#111111] border border-gray-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
                  <Gauge size={64} />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Track Wise Strength</p>
                <div className="flex-1 flex flex-col justify-between gap-1 z-10">
                  {PROBLEMS.map((problem) => {
                    const count = records.filter(r => r.problemId === problem.id && r.status !== "rejected").length;
                    return (
                      <div key={problem.id} className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{problem.id} {problem.alien}</span>
                        <span className="text-sm font-bold text-gray-200">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#111111] border border-gray-800/80 rounded-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-8 shadow-lg">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-[#0a0a0a] rounded-xl border border-gray-800 focus-within:border-green-500/50 transition-colors">
                <Search size={18} className="text-gray-500" />
                <input
                  type="search"
                  className="w-full bg-transparent border-none outline-none text-gray-200 placeholder-gray-600 text-sm font-medium py-1"
                  value={search}
                  placeholder="Search by team, college, email, or member name..."
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-gray-800 mx-1"></div>
              
              <div className="flex gap-2">
                <select 
                  className="px-4 py-3 text-sm font-medium bg-[#0a0a0a] border border-gray-800 rounded-xl text-gray-300 outline-none focus:border-green-500/50 cursor-pointer appearance-none min-w-[140px]" 
                  value={trackFilter} 
                  onChange={(event) => setTrackFilter(event.target.value)}
                >
                  <option value="">All Tracks</option>
                  {PROBLEMS.map((problem) => (
                    <option key={problem.id} value={problem.id}>{problem.id} - {problem.alien}</option>
                  ))}
                </select>
                
                <select 
                  className="px-4 py-3 text-sm font-medium bg-[#0a0a0a] border border-gray-800 rounded-xl text-gray-300 outline-none focus:border-green-500/50 cursor-pointer appearance-none min-w-[140px]" 
                  value={sort} 
                  onChange={(event) => setSort(event.target.value as SortKey)}
                >
                  <option value="newest">Newest First</option>
                  <option value="team">Team A–Z</option>
                  <option value="track">Track A-Z</option>
                </select>
              </div>
            </div>

            {loadError && (
              <div className="mb-8 p-5 bg-red-500/10 text-red-400 rounded-2xl border border-red-900/30 flex items-center gap-4 shadow-lg">
                <TriangleAlert size={24} className="shrink-0" />
                <p className="font-medium">{loadError}</p>
              </div>
            )}

            {/* Main Table */}
            {activeTab !== "audit" && (
              <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {loading && !records.length ? (
                <div className="py-24 flex flex-col justify-center items-center gap-4 text-gray-500">
                  <LoaderCircle size={32} className="animate-spin text-green-500" />
                  <span className="text-lg font-medium">Fetching secure records...</span>
                </div>
              ) : !filtered.length ? (
                <div className="py-24 flex flex-col justify-center items-center gap-4 text-gray-600">
                  <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-2">
                    <Search size={32} />
                  </div>
                  <p className="text-xl font-bold text-gray-300">No records found</p>
                  <p className="text-sm">Adjust your filters or await new submissions.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#161616] border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-8 py-5">Ident / Timestamp</th>
                        <th className="px-8 py-5">Team Origin</th>
                        <th className="px-8 py-5">Track Assignment</th>
                        <th className="px-8 py-5 min-w-[280px]">Team Members</th>
                        <th className="px-8 py-5">Comms & Data</th>
                        <th className="px-8 py-5">Clearance</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {filtered.map((record) => {
                        const track = PROBLEMS.find((problem) => problem.id === record.problemId);
                        return (
                          <tr key={record.id} className="hover:bg-gray-800/20 transition-colors group">
                            <td className="px-8 py-6 align-top">
                              <code className="block font-mono text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-lg w-fit mb-2 shadow-sm">
                                {record.passId}
                              </code>
                              <span className="text-xs text-gray-500 font-medium">
                                {record.createdAt?.seconds
                                  ? new Date(record.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })
                                  : "Unknown"}
                              </span>
                            </td>
                            
                            <td className="px-8 py-6 align-top">
                              <div className="font-bold text-gray-100 text-base whitespace-normal break-words max-w-[220px] leading-tight mb-1">{record.teamName}</div>
                              <div className="text-xs font-medium text-gray-500 whitespace-normal break-words max-w-[220px]">{record.collegeName}</div>
                            </td>
                            
                            <td className="px-8 py-6 align-top">
                              <div className="font-bold text-gray-200 mb-1">
                                <span className="text-green-500">{record.problemId}</span> {record.alien}
                              </div>
                              <div className="text-xs font-medium text-gray-500 whitespace-normal break-words max-w-[220px]">{track?.title}</div>
                            </td>
                            
                            <td className="px-8 py-6 align-top whitespace-normal min-w-[280px]">
                              <ul className="space-y-3">
                                {record.members?.map((member, index) => (
                                  <li key={`${member.name}-${index}`} className="text-sm bg-[#0a0a0a] p-2.5 rounded-xl border border-gray-800">
                                    <span className="font-bold text-gray-200 block mb-0.5">{member.name}</span>
                                    <span className="text-xs font-medium text-gray-500 block flex items-center gap-2">
                                      <span className="px-1.5 py-0.5 bg-gray-800 rounded">{member.course}</span>
                                      <span className="px-1.5 py-0.5 bg-gray-800 rounded">Y{String(member.year).replace(/^0/, "")}</span>
                                      <span>{member.phone}</span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                            
                            <td className="px-8 py-6 align-top">
                              <button
                                onClick={() => setSelectedTeam(record)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                              >
                                <Search size={14} /> View Submission
                              </button>
                            </td>
                            
                            <td className="px-8 py-6 align-top">
                              <div className="flex flex-col gap-2">
                                <span className={`inline-flex w-fit px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                  record.status === 'registered' ? 'bg-[#0a0a0a] border-gray-700 text-gray-300' :
                                  record.status === 'shortlisted' ? 'bg-emerald-950 border-green-500/50 text-green-400' :
                                  'bg-red-950 border-red-500/50 text-red-400'
                                }`}>
                                  {STATUS_LABEL[record.status]}
                                </span>
                                
                                {record.status !== "shortlisted" && (
                                  <button
                                    onClick={() => handleStatusChange(record, "shortlisted")}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors w-fit"
                                  >
                                    <BadgeCheck size={14} /> Shortlist
                                  </button>
                                )}
                                {record.status !== "rejected" && (
                                  <button
                                    onClick={() => handleStatusChange(record, "rejected")}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors w-fit"
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                )}
                              </div>
                            </td>
                            
                            <td className="px-8 py-6 align-top text-right">
                              <button
                                type="button"
                                className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all focus:outline-none opacity-0 group-hover:opacity-100"
                                aria-label={`Delete ${record.teamName}`}
                                title="Delete Registration"
                                onClick={() => {
                                  if (!window.confirm(`Are you absolutely sure you want to delete the registration for ${record.teamName}?\nThis action is permanent and cannot be undone.`)) return;
                                   deleteRegistration(record.id).then(() => refresh());
                                 }}
                               >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="bg-[#161616] border-t border-gray-800 px-8 py-4 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-500">
                  Displaying <span className="text-gray-300 font-bold">{filtered.length}</span> of {records.length} total entries
                </p>
                <div className="text-xs font-bold text-gray-600 tracking-widest uppercase">
                  System Version 2.4.1
                </div>
              </div>
              </div>
            )}

            {/* Audit Logs Table */}
            {activeTab === "audit" && (
              <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0a0a0a] border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        <th className="px-8 py-5">Time</th>
                        <th className="px-8 py-5">Admin</th>
                        <th className="px-8 py-5">Action</th>
                        <th className="px-8 py-5">Team</th>
                        <th className="px-8 py-5">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                            No audit logs available.
                          </td>
                        </tr>
                      ) : auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="px-8 py-4 text-sm text-gray-400">
                            {log.timestamp?.seconds
                              ? new Date(log.timestamp.seconds * 1000).toLocaleDateString("en-IN", {
                                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })
                              : "Unknown"}
                          </td>
                          <td className="px-8 py-4 text-sm font-medium text-gray-300">{log.adminEmail}</td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded border ${
                              log.action === 'SHORTLISTED' ? 'bg-emerald-950 border-green-500/50 text-green-400' :
                              log.action === 'REJECTED' ? 'bg-red-950 border-red-500/50 text-red-400' :
                              'bg-gray-900 border-gray-700 text-gray-300'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-sm font-bold text-gray-200">{log.teamName}</td>
                          <td className="px-8 py-4 text-sm text-gray-400 max-w-[300px] break-words">{log.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}



            <div className="mt-12 text-center text-gray-600 text-xs tracking-widest font-bold pb-8">
              END OF RECORDS
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navbar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-gray-800 flex items-center justify-around z-40 pb-safe">
        <button 
          onClick={() => setActiveTab("all")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'all' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Users size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">All</span>
        </button>
        <button 
          onClick={() => setActiveTab("shortlisted")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'shortlisted' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <BadgeCheck size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Selected</span>
        </button>
        <button 
          onClick={() => setActiveTab("audit")} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'audit' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <ShieldAlert size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Audit</span>
        </button>
        <button 
          onClick={() => signOut(auth)} 
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-500/70 hover:text-red-400"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Logout</span>
        </button>
      </nav>

      {/* ---------------- Submission Modal ---------------- */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-[#111111] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Search size={16} />
                </div>
                Team Submission
              </h2>
              <button onClick={() => setSelectedTeam(null)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Team Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0a] p-5 rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Team Name</p>
                    <p className="font-bold text-gray-200 text-lg">{selectedTeam.teamName}</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-5 rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">College</p>
                    <p className="font-bold text-gray-200 text-lg">{selectedTeam.collegeName}</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-5 rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Track</p>
                    <p className="font-bold text-green-400 text-lg">{selectedTeam.problemId} - {selectedTeam.alien}</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-5 rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Contact Email</p>
                    <a href={`mailto:${selectedTeam.emailId}`} className="font-bold text-blue-400 hover:underline text-lg truncate block">{selectedTeam.emailId}</a>
                  </div>
                </div>
                {selectedTeam.statusReason && (
                  <div className="bg-[#0a0a0a] p-5 rounded-xl border border-gray-800 mt-4">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Status Reason ({STATUS_LABEL[selectedTeam.status]})</p>
                    <p className="font-medium text-gray-300">{selectedTeam.statusReason}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Roster ({selectedTeam.members?.length || 0})</h3>
                <div className="grid grid-cols-1 gap-4">
                  {selectedTeam.members?.map((member, i) => (
                    <div key={i} className="bg-[#0a0a0a] p-5 rounded-xl border border-gray-800 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 w-full">
                        <p className="font-bold text-gray-200 text-lg mb-2">{member.name}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Reg No</p>
                            <p className="text-sm font-mono text-gray-300">{member.registrationNo}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Course & Year</p>
                            <p className="text-sm text-gray-300">{member.course}, Yr {String(member.year).replace(/^0/, "")} (Sem {member.semester})</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Email</p>
                            <a href={`mailto:${member.email}`} className="text-sm text-blue-400 hover:underline truncate block">{member.email}</a>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Phone</p>
                            <a href={`tel:${member.phone}`} className="text-sm font-mono text-blue-400 hover:underline">{member.phone}</a>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">DOB</p>
                            <p className="text-sm text-gray-300">{member.dob}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Address</p>
                            <p className="text-sm text-gray-300 whitespace-normal break-words">{member.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pitch Deck & Data</h3>
                {selectedTeam.pptUrl ? (
                  <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                        <Download size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-200 text-lg">Submission File</p>
                        <p className="text-sm text-gray-500 mt-1">View or download the presentation</p>
                      </div>
                    </div>
                    <a href={selectedTeam.pptUrl} target="_blank" rel="noreferrer" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-center shrink-0">
                      Open File
                    </a>
                  </div>
                ) : (
                  <div className="bg-[#0a0a0a] p-8 rounded-xl border border-gray-800 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-gray-900 text-gray-700 rounded-full flex items-center justify-center mb-3">
                      <X size={24} />
                    </div>
                    <p className="text-gray-400 font-medium">No pitch deck was attached to this registration.</p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-800 pt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


