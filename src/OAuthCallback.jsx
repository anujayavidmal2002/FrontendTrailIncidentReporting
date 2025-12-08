import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          setError('No authorization code received');
          setLoading(false);
          return;
        }

        // Exchange code for tokens via backend
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.user) {
          // Save user info to localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
          }
          if (data.idToken) {
            localStorage.setItem('idToken', data.idToken);
          }

          // Get redirect path or default to home
          const redirectPath = localStorage.getItem('authRedirect') || '/';
          localStorage.removeItem('authRedirect');

          // Redirect to app
          window.location.href = redirectPath;
        } else {
          setError('No user data received');
          setLoading(false);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Authenticating with Google...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
