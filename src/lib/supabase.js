import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://okbjhmmpjjcdbphdhowj.supabase.co'
const supabaseAnonKey = 'sb_publishable_NQPryTP2IwM82Z29O8Iy8Q_VCDXrTvQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
