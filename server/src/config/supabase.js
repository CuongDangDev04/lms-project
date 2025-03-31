const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');   
dotenv.config();
// Lấy URL và API Key từ môi trường
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// Khởi tạo client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;