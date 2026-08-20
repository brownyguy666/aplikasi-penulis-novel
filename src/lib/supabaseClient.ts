import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NovelProject } from '@/types/novel';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

/**
 * Get Supabase client instance with dynamic credentials or environment variables fallback.
 */
export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    cachedUrl = url;
    cachedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

/**
 * Save / Push Novel Project to Supabase
 */
export async function pushProjectToSupabase(
  project: NovelProject,
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient(customUrl, customKey);
  if (!supabase) {
    return {
      success: false,
      message: 'Kredensial Supabase (URL / Anon Key) belum dikonfigurasi. Mode lokal tetap aktif.'
    };
  }

  try {
    const { error } = await supabase
      .from('novel_projects')
      .upsert({
        id: project.id,
        title: project.title,
        genre: project.genre,
        project_data: project,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: `Proyek "${project.title}" berhasil disinkronkan ke Supabase Cloud.`
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal sinkronisasi ke Supabase';
    return {
      success: false,
      message
    };
  }
}

/**
 * Pull Novel Project from Supabase
 */
export async function pullProjectFromSupabase(
  projectId: string,
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; project?: NovelProject; message: string }> {
  const supabase = getSupabaseClient(customUrl, customKey);
  if (!supabase) {
    return {
      success: false,
      message: 'Kredensial Supabase (URL / Anon Key) belum dikonfigurasi.'
    };
  }

  try {
    const { data, error } = await supabase
      .from('novel_projects')
      .select('project_data')
      .eq('id', projectId)
      .single();

    if (error) {
      throw error;
    }

    if (!data?.project_data) {
      return {
        success: false,
        message: 'Data proyek tidak ditemukan di database cloud.'
      };
    }

    return {
      success: true,
      project: data.project_data as NovelProject,
      message: 'Proyek berhasil dimuat dari cloud Supabase!'
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat dari Supabase';
    return {
      success: false,
      message
    };
  }
}

/**
 * Sign Up with Email & Password
 */
export async function signUpUser(
  email: string,
  pass: string,
  customUrl?: string,
  customKey?: string
) {
  const supabase = getSupabaseClient(customUrl, customKey);
  if (!supabase) {
    throw new Error('Kredensial Supabase (URL / Anon Key) belum dikonfigurasi.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass
  });

  if (error) throw error;
  return data;
}

/**
 * Sign In with Email & Password
 */
export async function signInUser(
  email: string,
  pass: string,
  customUrl?: string,
  customKey?: string
) {
  const supabase = getSupabaseClient(customUrl, customKey);
  if (!supabase) {
    throw new Error('Kredensial Supabase (URL / Anon Key) belum dikonfigurasi.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if (error) throw error;
  return data;
}

/**
 * Sign Out User
 */
export async function signOutUser(customUrl?: string, customKey?: string) {
  const supabase = getSupabaseClient(customUrl, customKey);
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get Current Logged In User
 */
export async function getCurrentUser(customUrl?: string, customKey?: string) {
  const supabase = getSupabaseClient(customUrl, customKey);
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

/**
 * Push Generation Log to Supabase Audit Table
 */
export async function pushGenerationLogToSupabase(
  projectId: string,
  log: {
    chapterId: string;
    mode: string;
    model: string;
    prompt: string;
    outputText: string;
    wordCount: number;
  },
  customUrl?: string,
  customKey?: string
) {
  const supabase = getSupabaseClient(customUrl, customKey);
  if (!supabase) return;

  try {
    await supabase.from('generation_logs').insert({
      project_id: projectId,
      chapter_id: log.chapterId,
      mode: log.mode,
      model: log.model,
      prompt: log.prompt,
      output_text: log.outputText,
      word_count: log.wordCount,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Silent fallback: Failed to log generation to Supabase:', err);
  }
}
