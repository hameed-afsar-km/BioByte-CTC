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
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  Users from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { PROBLEMS } from "@/data/site";
import { auth, isFirebaseReady, missingFirebaseKeys } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/access";
import {
  deleteRegistration,
  fetchRegistrations,
  updateRegistrationStatus from "@/lib/registrations";
import type { RegistrationRecord } from "@/lib/types";
import OmnitrixMark from "./OmnitrixMark";

type SortKey = "newest" | "team" | "track";

const STATUSES: RegistrationRecord["status"][] = ["registered", "shortlisted", "rejected"];

const STATUS_LABEL: Record<RegistrationRecord["status"], string> = {
  registered: "Registered",
  shortlisted: "Shortlisted",
  rejected: "Rejected";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Stable empty references, so `data?.records ?? EMPTY` keeps its identity. */
const NO_RECORDS: RegistrationRecord[] = [];

/** One round trip for everything the dashboard shows. No state, no side effects. */
async function readDashboard() {
  const records = await fetchRegistrations();
  return { records };
}

export default function AdminDashboard() {
  /* `undefined` = the auth listener has not answered yet, `null` = signed out. */
  const [user, setUser] = useState<{ email: string | null } | null | undefined>(undefined);
  const [data, setData] = useState<{
    records: RegistrationRecord[];
      key: number;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /* Bumping this re-runs the load effect â€” the manual refresh button. */
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((key) => key + 1);

  const authReady = isFirebaseReady ? user !== undefined : true;
  const isAdmin = isAdminEmail(user?.email);

  /* Loading is derived, not stored: a fetch is in flight whenever the data
     on hand is missing or was loaded for an older request key. */
  const loading = isAdmin && (!data || data.key !== refreshKey);
  const records = data?.records ?? NO_RECORDS;


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
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err?.message || "Could not read registrations. Check Firestore security rules.");
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, refreshKey]);

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
  }, [records, search, trackFilter, sort]);

  const totals = useMemo(() => {
    const capacity = PROBLEMS.length * 9999;
    return {
      teams: records.length,
      capacity,
      people: records.reduce((sum, record) => sum + (record.teamSize ?? 0), 0),
      shortlisted: records.filter((record) => record.status === "shortlisted").length;
  }, [records, slots]);

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
    link.download = `omnicon-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------- gate ---------------- */

  if (!authReady) {
    return (
      <div className="admin-shell">
        <p className="page-loading">
          <LoaderCircle size={16} className="spin" /> Linkingâ€¦
        </p>
      </div>
    );
  }

  if (!isFirebaseReady) {
    return (
      <div className="admin-shell">
        <div className="admin-blocked">
          <TriangleAlert size={26} aria-hidden="true" />
          <h1>Dashboard unavailable</h1>
          <p>
            Firebase is not configured. Missing: {missingFirebaseKeys.join(", ")}.
          </p>
          <Link className="btn btn-secondary" href="/">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-shell">
        <div className="admin-blocked">
          <ShieldAlert size={26} aria-hidden="true" />
          <h1>Organisers only</h1>
          <p>
            {user?.email
              ? `${user.email} is not on the organiser list.`
              : "Sign in with an organiser Google account to continue."}
          </p>

          {authError ? <p className="alert alert-error">{authError}</p> : null}

          <div className="admin-blocked-actions">
            {!user ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSignIn}
                disabled={signingIn}
              >
                {signingIn ? <LoaderCircle size={16} className="spin" /> : <BadgeCheck size={16} />}
                {signingIn ? "Signing inâ€¦" : "Sign in with Google"}
              </button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => signOut(auth)}>
                <LogOut size={16} />
                Sign out
              </button>
            )}
            <Link className="btn btn-ghost" href="/">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- dashboard ---------------- */

  return (
    <div className="admin-shell">
      <div className="container admin-inner">
        <header className="admin-head">
          <div className="admin-brand">
            <OmnitrixMark className="admin-mark" />
            <div>
              <p className="kicker">Organiser console</p>
              <h1 className="admin-title">Registration Control</h1>
              <p className="admin-sub">
                Signed in as {user?.email} Â·{" "}
                <button type="button" className="link-btn" onClick={() => signOut(auth)}>
                  sign out
                </button>
              </p>
            </div>
          </div>

          <div className="admin-head-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={refresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? "spin" : undefined} />
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={exportCsv}
              disabled={!filtered.length}
            >
              <Download size={15} />
              Export CSV
            </button>
            <Link className="btn btn-ghost btn-sm" href="/">
              <ArrowLeft size={15} />
              Site
            </Link>
          </div>
        </header>

        {/* ---------------- stat tiles ---------------- */}
        <div className="stat-tiles">
          <div className="tile card">
            <span className="tile-key">Teams</span>
            <span className="tile-value">{totals.teams}</span>
            <span className="tile-foot">of {totals.capacity} slots</span>
          </div>
          <div className="tile card">
            <span className="tile-key">
              <Users size={13} aria-hidden="true" /> Operatives
            </span>
            <span className="tile-value">{totals.people}</span>
            <span className="tile-foot">across all tracks</span>
          </div>
          <div className="tile card">
            <span className="tile-key">
              <BadgeCheck size={13} aria-hidden="true" /> Shortlisted
            </span>
            <span className="tile-value">{totals.shortlisted}</span>
            <span className="tile-foot">advanced to Round 2</span>
          </div>
          <div className="tile card">
            <span className="tile-key">
              <Gauge size={13} aria-hidden="true" /> Tracks full
            </span>
            <span className="tile-value">
              {
                PROBLEMS.filter((problem) => {
                  return (slot?.count ?? 0) >= (slot?.capacity ?? problem.capacity);
                }).length
              }
            </span>
            <span className="tile-foot">of {PROBLEMS.length} alien tracks</span>
          </div>
        </div>

        {/* ---------------- capacity ---------------- */}
        <section className="admin-panel card bracket">
            {PROBLEMS.map((problem) => {

              return (
                <li
                  key={problem.id}
                  style={{ "--hue": problem.hue } as React.CSSProperties}
                >
                    <b style={{ color: problem.hue }}>{problem.alien}</b>
                    <em>{problem.id}</em>
                  </span>
                  </span>
                    {count} / {capacity}
                  </span>
                    <span className="sr-only">Capacity for {problem.alien}</span>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      defaultValue={capacity}
                      onBlur={(event) => {
                        const next = Number(event.target.value);
                      }}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------------- filters ---------------- */}
        <div className="admin-filters">
          <label className="admin-search">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">Search registrations</span>
            <input
              type="search"
              value={search}
              placeholder="Search team, college, email, memberâ€¦"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select className="input admin-select" value={trackFilter} onChange={(event) => setTrackFilter(event.target.value)}>
            <option value="">All tracks</option>
            {PROBLEMS.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.alien}
              </option>
            ))}
          </select>

          <select className="input admin-select" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="newest">Newest first</option>
            <option value="team">Team Aâ€“Z</option>
            <option value="track">Track</option>
          </select>
        </div>

        {loadError ? <p className="alert alert-error">{loadError}</p> : null}

        {/* ---------------- table ---------------- */}
        {loading && !records.length ? (
          <p className="page-loading">
            <LoaderCircle size={16} className="spin" /> Loading registrationsâ€¦
          </p>
        ) : !filtered.length ? (
          <p className="admin-empty">
            No registrations yet. They appear here the moment a team submits the form.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pass</th>
                  <th>Team</th>
                  <th>Track</th>
                  <th>Operatives</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const track = PROBLEMS.find((problem) => problem.id === record.problemId);
                  return (
                    <tr key={record.id}>
                      <td>
                        <code className="admin-pass">{record.passId}</code>
                        <span className="admin-date">
                          {record.createdAt?.seconds
                            ? new Date(record.createdAt.seconds * 1000).toLocaleDateString("en-IN")
                            : "â€”"}
                        </span>
                      </td>
                      <td>
                        <b>{record.teamName}</b>
                        <span className="admin-muted">{record.collegeName}</span>
                      </td>
                      <td>
                        <span className="admin-track" style={{ color: track?.hue }}>
                          {record.problemId} {record.alien}
                        </span>
                        <span className="admin-muted">{track?.title}</span>
                      </td>
                      <td>
                        <ul className="admin-members">
                          {record.members?.map((member, index) => (
                            <li key={`${member.name}-${index}`}>
                              {member.name}
                              <em>
                                {member.course} Â· Y{String(member.year).replace(/^0/, "")} Â·{" "}
                                {member.phone}
                              </em>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <a href={`mailto:${record.emailId}`}>{record.emailId}</a>
                        {record.pptUrl ? (
                          <a className="admin-muted" href={record.pptUrl} target="_blank" rel="noreferrer">
                            Deck
                          </a>
                        ) : (
                          <span className="admin-muted">No deck</span>
                        )}
                      </td>
                      <td>
                        <select
                          className="input admin-status"
                          value={record.status}
                          onChange={(event) => {
                            const next = event.target.value as RegistrationRecord["status"];
                            /* Optimistic: paint the new status immediately,
                               then let the refresh reconcile with Firestore. */
                            setData((current) =>
                              current
                                ? {
                                    ...current,
                                    records: current.records.map((row) =>
                                      row.id === record.id ? { ...row, status: next } : row,
                                    )
                                : current,
                            );
                            updateRegistrationStatus(record.id, next).catch(() => refresh());
                          }}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-delete"
                          aria-label={`Delete ${record.teamName}`}
                          onClick={() => {
                            if (!window.confirm(`Delete the registration for ${record.teamName}?`)) return;
                            deleteRegistration(record.id).then(refresh);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-foot">
          Showing {filtered.length} of {records.length} registrations.
        </p>
      </div>
    </div>
  );
}


