import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://buihfdgbduguhikmeecy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aWhmZGdiZHVndWhpa21lZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzcxNTgsImV4cCI6MjA5Mjk1MzE1OH0.z4h3n-iqcaC4EKKgzXppnYiRF3jVcE1U7RvnfwlmKJA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const { data: profile } = await supabase.from("profiles").select("*").eq("slug", "demo").single();
  console.log("Profile:", profile);

  if (profile) {
    const { data: products } = await supabase.from("products").select("*").eq("store_id", profile.id);
    console.log("Products count:", products?.length);
    console.log("First product sample:", products?.[0]);
  }
}

main();
