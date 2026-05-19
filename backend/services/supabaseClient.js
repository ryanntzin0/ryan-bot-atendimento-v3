const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.");
}

const supabase = createClient(supabaseUrl || "", serviceKey || "", {
  auth: { persistSession: false }
});

module.exports = { supabase };
