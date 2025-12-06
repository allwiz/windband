import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { authService } from '../lib/auth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      // Prevent double execution in React Strict Mode
      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;

      try {
        const result = await authService.verifyEmail(token);

        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Your email has been verified successfully!');

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', {
              state: { message: 'Email verified! You can now log in.' }
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Email verification failed. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div className="bg-blue-100 p-4 rounded-full">
                <Loader className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            {status === 'verifying' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {status === 'verifying' && 'Please wait while we verify your email address...'}
            {message}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Redirecting to login page in 3 seconds...
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-accent-600 hover:bg-accent-700 transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Link
                  to="/signup"
                  className="flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-accent-600 hover:bg-accent-700 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Sign Up Again
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {status === 'verifying' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  This should only take a moment...
                </p>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link to="/contact" className="text-accent-600 hover:text-accent-500 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
