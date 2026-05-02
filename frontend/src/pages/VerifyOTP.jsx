import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth(); // We need to expose checkAuth in AuthContext

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/auth/verify-otp', { email, otp });
      // Trigger background check but navigate immediately
      checkAuth(); 
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.66l7-4.67a2 2 0 012.22 0l7 4.66a2 2 0 01.89 1.67V19a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11l9 6 9-6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Email</h1>
          <p className="text-gray-500 mt-2">
            We've sent a 6-digit code to <br/> <span className="font-bold text-gray-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center uppercase tracking-widest">Enter Code</label>
            <input 
              type="text" 
              maxLength="6"
              className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 outline-none transition"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition transform active:scale-[0.98] shadow-lg shadow-blue-200 disabled:opacity-50"
            disabled={loading || otp.length < 6}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code? <br/>
            <button className="text-blue-600 font-bold mt-1 hover:underline">Resend OTP</button>
          </p>
          <p className="text-xs text-gray-400 mt-4 italic">
            Tip: Check the backend console to see the mock OTP!
          </p>
        </div>
      </div>
    </div>
  );
}
