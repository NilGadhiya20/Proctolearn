import { supabase } from '../services/supabaseClient';

// Start Google OAuth via Supabase
export const signInWithGoogle = async () => {
  const redirectTo =
    import.meta.env.VITE_SUPABASE_REDIRECT_URL || `${window.location.origin}/login`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      scopes: 'openid email profile'
    }
  });

  if (error) {
    console.error('Supabase Google Sign-In Error:', error);
    throw error;
  }

  // Supabase will redirect; ensure redirect happens even if auto redirect is disabled
  if (data?.url) {
    window.location.assign(data.url);
  }

  return { redirecting: true };
};

// Complete Supabase OAuth after redirect back to the app
export const completeSupabaseOAuth = async () => {
  const hasOAuthParams =
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token') ||
    window.location.search.includes('code=');

  if (!hasOAuthParams) return null;

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Supabase OAuth callback error:', error);
    throw error;
  }

  // Clean query/hash so tokens are not left in the URL
  window.history.replaceState({}, document.title, window.location.pathname);

  return data?.session || null;
};

export const signInWithMicrosoft = async () => {
  throw new Error('Microsoft Sign-In not configured. Please set up Azure AD.');
};
