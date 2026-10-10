import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pptPath = formData.get("pptPath") as string;
    
    if (!file || !pptPath) throw new Error("Missing file or pptPath");
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("submissions")
      .upload(pptPath, fileBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        upsert: true
      });
      
    if (error) {
      return NextResponse.json({ error: `Supabase upload failed: ${error.message}` }, { status: 500 });
    }
    
    const { data: publicUrlData } = supabase.storage
      .from("submissions")
      .getPublicUrl(pptPath);
      
    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
