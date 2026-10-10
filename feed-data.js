const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
process.env = { ...process.env, ...env };
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const email = '240151601048@crescent.education';
const password = 'BioAvengers2026!'; // Temporary password

async function run() {
  console.log("Starting data feed...");
  
  // 1. Authenticate with Firebase Auth
  console.log("Authenticating as " + email + "...");
  let idToken, localId;
  try {
    // Try to sign up
    const signUpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    
    let data = await signUpRes.json();
    if (data.error && data.error.message === 'EMAIL_EXISTS') {
      console.log("Account exists. Signing in instead...");
      const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      data = await signInRes.json();
      if (data.error) throw new Error("Failed to sign in: " + data.error.message + " (The user might have a different password, we cannot proceed without their password or Admin SDK)");
    } else if (data.error) {
      throw new Error(data.error.message);
    }
    
    idToken = data.idToken;
    localId = data.localId;
    console.log("Authenticated! UID:", localId);
  } catch (err) {
    console.error("Auth Error:", err.message);
    process.exit(1);
  }

  // 2. Upload PPT to Supabase
  console.log("Uploading PPT to Supabase...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const filePath = path.join(__dirname, 'public', 'BIOBYTE ( BIO AVENGERS PPT) (1).pptx');
  const fileBuffer = fs.readFileSync(filePath);
  
  // Generate deterministic passId and registrationId
  const problemId = 'OM-05';
  const teamName = 'BIO-AVENGERS';
  const passId = "OMNI-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const safeName = "BIOBYTE___BIO_AVENGERS_PPT___1_.pptx";
  // We'll mimic the crypto logic for id if possible, but Firestore REST API allows us to just PUT a specific document.
  // Actually, we must compute ID exactly as `registrationIdFor(emailId)`!
  // In the app, it's SHA-256 of emailId.
  const crypto = require('crypto');
  const id = 'reg-' + crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex').substring(0, 16);
  
  const pptPath = `ppts/${id}/${passId}-${safeName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('submissions')
    .upload(pptPath, fileBuffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      upsert: true
    });
    
  if (uploadError) {
    console.error("Supabase Upload Error:", uploadError);
    process.exit(1);
  }
  
  const { data: publicUrlData } = supabase.storage.from('submissions').getPublicUrl(pptPath);
  const pptUrl = publicUrlData.publicUrl;
  console.log("Uploaded PPT! URL:", pptUrl);

  // 3. Write to Firestore
  console.log("Writing registration to Firestore...");
  
  // Firestore REST requires a specific JSON format
  const docData = {
    fields: {
      id: { stringValue: id },
      passId: { stringValue: passId },
      uid: { stringValue: localId },
      teamName: { stringValue: teamName },
      collegeName: { stringValue: "B.S. Abdur Rahman Crescent Institute of Science and Technology" },
      teamSize: { integerValue: "4" },
      emailId: { stringValue: email },
      problemId: { stringValue: problemId },
      problemTitle: { stringValue: "XLR8" },
      alien: { stringValue: "XLR8" },
      hue: { stringValue: "#35A7FF" },
      abstract: { stringValue: "VET-AMR RADAR is a comprehensive hospital intelligence platform that monitors and that helps tracking antimicrobial resistance in veterinary care. It gathers data from lab results and prescriptions into a secure, isolated data lakehouse. Using an advanced analytics engine, the platform provides real-time early warnings, signals unusual resistance trends on an actionable dashboard, and helps clinicians review outcomes to make safer, data-driven treatment decisions." },
      pptUrl: { stringValue: pptUrl },
      pptPath: { stringValue: pptPath },
      pptName: { stringValue: "BIOBYTE ( BIO AVENGERS PPT) (1).pptx" },
      assistanceRequirement: { stringValue: "None" },
      status: { stringValue: "registered" },
      round: { stringValue: "round-1" },
      createdAt: { timestampValue: new Date().toISOString() },
      members: {
        arrayValue: {
          values: [
            {
              mapValue: {
                fields: {
                  name: { stringValue: "SHEMA BEGUM A" },
                  registrationNo: { stringValue: "240151601048" },
                  year: { stringValue: "3" },
                  semester: { stringValue: "V" },
                  course: { stringValue: "B TECH BIOTECH" },
                  email: { stringValue: "240151601048@crescent.education" },
                  phone: { stringValue: "8668199406" },
                  dob: { stringValue: "16.09.2006" },
                  address: { stringValue: "no.13, white villa, Sai sarvesh nagar, kumizhi hills, Kandigai, chennai . 603202" }
                }
              }
            },
            {
              mapValue: {
                fields: {
                  name: { stringValue: "Shaik Abu Hamza" },
                  registrationNo: { stringValue: "240171601056" },
                  year: { stringValue: "3" },
                  semester: { stringValue: "V" },
                  course: { stringValue: "b tech AIDS-A" },
                  email: { stringValue: "240171601056@crescent.education" },
                  phone: { stringValue: "8688200451" },
                  dob: { stringValue: "08-08-2006" },
                  address: { stringValue: "KBA MEN HOSTEL, bsacist, vandalur ." }
                }
              }
            },
            {
              mapValue: {
                fields: {
                  name: { stringValue: "Kaviya S" },
                  registrationNo: { stringValue: "240151601027" },
                  year: { stringValue: "3" },
                  semester: { stringValue: "V" },
                  course: { stringValue: "Btech Biotechnology" },
                  email: { stringValue: "240151601027@crescent.education" },
                  phone: { stringValue: "9345572498" },
                  dob: { stringValue: "03/01/2007" },
                  address: { stringValue: "Plot no 80, shri sai illam, sameera wood haven, Nenmeli, Chengalpet- 603003" }
                }
              }
            },
            {
              mapValue: {
                fields: {
                  name: { stringValue: "Hafsa A R" },
                  registrationNo: { stringValue: "240151601067" },
                  year: { stringValue: "3" },
                  semester: { stringValue: "V" },
                  course: { stringValue: "Btech Biotechnology" },
                  email: { stringValue: "240151601067@crescent.education" },
                  phone: { stringValue: "9629408495" },
                  dob: { stringValue: "01/05/2007" },
                  address: { stringValue: "TBAK WOMEN HOSTEL, bsacist, vandalur." }
                }
              }
            }
          ]
        }
      }
    }
  };

  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/registrations/${id}`;
  const fsRes = await fetch(firestoreUrl, {
    method: 'PATCH', // PATCH creates if doesn't exist
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(docData)
  });
  
  const fsData = await fsRes.json();
  if (fsData.error) {
    console.error("Firestore Error:", JSON.stringify(fsData.error, null, 2));
    process.exit(1);
  }
  
  console.log("Successfully fed BIO-AVENGERS data into the application!");
  console.log("Document ID:", id);
  console.log("Pass ID:", passId);
}

run();
