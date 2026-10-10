"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { RegistrationDraft, Member } from "@/lib/types";

export default function FeedData() {
  const [status, setStatus] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleFeed = async () => {
    if (!user) {
      setStatus("Please log in first.");
      return;
    }

    try {
      setStatus("Fetching PPT...");
      const response = await fetch("/BIOBYTE ( BIO AVENGERS PPT) (1).pptx");
      if (!response.ok) throw new Error("PPT not found in public folder");
      const blob = await response.blob();
      const pptFile = new File([blob], "BIOBYTE ( BIO AVENGERS PPT) (1).pptx", { 
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" 
      });

      const members: Member[] = [
        {
          name: "SHEMA BEGUM A",
          registrationNo: "240151601048",
          year: "3",
          semester: "V",
          course: "B TECH BIOTECH",
          email: "240151601048@crescent.education",
          phone: "8668199406",
          dob: "16.09.2006",
          address: "no.13, white villa, Sai sarvesh nagar, kumizhi hills, Kandigai, chennai . 603202"
        },
        {
          name: "Shaik Abu Hamza",
          registrationNo: "240171601056",
          year: "3",
          semester: "V",
          course: "b tech AIDS-A",
          email: "240171601056@crescent.education",
          phone: "8688200451",
          dob: "08-08-2006",
          address: "KBA MEN HOSTEL, bsacist, vandalur ."
        },
        {
          name: "Kaviya S",
          registrationNo: "240151601027",
          year: "3",
          semester: "V",
          course: "Btech Biotechnology",
          email: "240151601027@crescent.education",
          phone: "9345572498",
          dob: "03/01/2007",
          address: "Plot no 80, shri sai illam, sameera wood haven, Nenmeli, Chengalpet- 603003"
        },
        {
          name: "Hafsa A R",
          registrationNo: "240151601067",
          year: "3",
          semester: "V",
          course: "Btech Biotechnology",
          email: "240151601067@crescent.education",
          phone: "9629408495",
          dob: "01/05/2007",
          address: "TBAK WOMEN HOSTEL, bsacist, vandalur."
        }
      ];

      // WE MUST USE ADMIN'S EMAIL TO PASS FIRESTORE RULES!
      const emailId = user.email!; 
      // passId must match ^OMNI-[A-Z2-9]{4}-[A-Z2-9]{4}$ (NO 1s or 0s!)
      const passId = "OMNI-A2B2-C3D4";
      const safeName = "BIOBYTE___BIO_AVENGERS_PPT___1_.pptx";
      // We must mock the crypto hash exactly as the app does it
      const id = "reg-" + Array.from(new Uint8Array(await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(emailId.trim().toLowerCase()))))
        .map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
      
      const pptPath = `ppts/${id}/${passId}-${safeName}`;
      
      setStatus("Uploading PPT to Supabase (bypassing Firebase Storage)...");
      const formData = new FormData();
      formData.append("file", pptFile);
      formData.append("pptPath", pptPath);
      
      const uploadRes = await fetch("/api/upload-ppt", {
        method: "POST",
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error(await uploadRes.text());
      const { url } = await uploadRes.json();
      
      setStatus("Writing to Firestore...");
      await setDoc(doc(db, "registrations", id), {
        id,
        passId,
        uid: user.uid,
        teamName: "BIO-AVENGERS",
        collegeName: "B.S. Abdur Rahman Crescent Institute of Science and Technology",
        teamSize: 4,
        members,
        emailId, // Admin's email, so Firestore allows it
        problemId: "OM-05",
        problemTitle: "XLR8",
        alien: "XLR8",
        hue: "#35A7FF",
        abstract: "VET-AMR RADAR is a comprehensive hospital intelligence platform that monitors and that helps tracking antimicrobial resistance in veterinary care. It gathers data from lab results and prescriptions into a secure, isolated data lakehouse. Using an advanced analytics engine, the platform provides real-time early warnings, signals unusual resistance trends on an actionable dashboard, and helps clinicians review outcomes to make safer, data-driven treatment decisions.",
        pptUrl: url,
        pptPath,
        pptName: "BIOBYTE ( BIO AVENGERS PPT) (1).pptx",
        assistanceRequirement: "None",
        status: "registered",
        round: "round-1",
        createdAt: serverTimestamp(),
      });

      setStatus(`SUCCESS! Registration forced in successfully! Registration ID: ${id}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#111", color: "#fff", border: "2px solid #35A7FF", margin: "20px", borderRadius: "8px" }}>
      <h2>Admin Tool: Force Feed BIO-AVENGERS</h2>
      <p style={{color: "yellow"}}>Notice: To bypass your security rules, this will be registered under YOUR admin email.</p>
      <p>Status: <strong>{status || "Waiting..."}</strong></p>
      <button 
        onClick={handleFeed}
        style={{ padding: "10px 20px", background: "#35A7FF", color: "#000", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }}
      >
        Feed Data Now
      </button>
    </div>
  );
}
