import { supabase } from '../services/supabaseClient';

// Start Google OAuth via Supabase with POPUP
export const signInWithGoogle = async (institutionCode = 'PPSU') => {
  console.log('🔵 Starting Google OAuth popup flow...');
  
  // Calculate popup position for centering
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const redirectTo = `${window.location.origin}/login`;

  try {
    // Use Supabase OAuth with skipBrowserRedirect to get the URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        scopes: 'openid email profile',
        skipBrowserRedirect: true // Get URL without auto-redirect
      }
    });

    if (error) {
      console.error('Supabase Google Sign-In Error:', error);
      throw error;
    }

    if (!data?.url) {
      throw new Error('No OAuth URL returned from Supabase');
    }

    // Open popup with OAuth URL
    const popup = window.open(
      data.url,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      throw new Error('Popup was blocked. Please allow popups for this site.');
    }

    // Listen for the callback from popup
    return new Promise((resolve, reject) => {
      // Check if popup is closed manually
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Google sign-in was cancelled'));
        }
      }, 1000);

      // Listen for messages from the popup
      const messageHandler = async (event) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          console.log('✅ Google OAuth successful, session received');
          resolve({
            session: event.data.session,
            institutionCode
          });
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Google authentication failed'));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
};

// Complete Supabase OAuth after redirect back (for popup callback)
export const completeSupabaseOAuth = async () => {
  const hasOAuthParams =
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token') ||
    window.location.search.includes('code=');

  if (!hasOAuthParams) return null;

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Supabase OAuth callback error:', error);
      
      // If in popup, send error to parent
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_OAUTH_ERROR',
          error: error.message
        }, window.location.origin);
        window.close();
      }
      throw error;
    }

    // If in popup, send session to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_OAUTH_SUCCESS',
        session: data.session
      }, window.location.origin);
      
      // Close popup after short delay to show success
      setTimeout(() => {
        window.close();
      }, 500);
      
      return null; // Don't process in popup
    }

    // Clean query/hash so tokens are not left in the URL
    window.history.replaceState({}, document.title, window.location.pathname);

    return data?.session || null;
  } catch (error) {
    console.error('OAuth completion error:', error);
    
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_OAUTH_ERROR',
        error: error.message
      }, window.location.origin);
      window.close();
    }
    
    throw error;
  }
};

export const signInWithMicrosoft = async () => {
  throw new Error('Microsoft Sign-In not configured. Please set up Azure AD.');
};
