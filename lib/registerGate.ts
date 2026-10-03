"use client";

/**
 * Cross-section signal for pre-selecting an alien track.
 *
 * The aliens gallery and the registration form are siblings deep in the tree,
 * so they coordinate through one custom event instead of shared context. The
 * request is also sticky: the form is lazy, so a click made before it mounts
 * would otherwise be lost.
 */

export const SELECT_TRACK_EVENT = "omnicon:select-track";

let pendingTrack: string | null = null;

/** Asks the registration form to lock itself to `problemId`. */
export function selectTrack(problemId: string) {
  pendingTrack = problemId;
  window.dispatchEvent(new CustomEvent(SELECT_TRACK_EVENT, { detail: problemId }));
}

/** Reads and clears the pending track id. */
export function consumePendingTrack(): string | null {
  const value = pendingTrack;
  pendingTrack = null;
  return value;
}