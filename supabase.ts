
import { createClient } from '@supabase/supabase-js';

/**
 * আপনার প্রেরিত তথ্যের ভিত্তিতে Supabase কানেকশন আপডেট করা হয়েছে।
 */
const SUPABASE_URL = 'https://pzrrwuhaoaaasfaswmyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cnJ3dWhhb2FhYXNmYXN3bXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDQ0NzQsImV4cCI6MjA4Njg4MDQ3NH0.quqgiGS-LIzlfAoTepB-zThbYdTSLzZ9iPsRJO-d9u0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
