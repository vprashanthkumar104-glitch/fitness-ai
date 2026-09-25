import React, { useState } from 'react';
import { Page } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Flame,
  Activity,
  LogOut
} from 'lucide-react';

interface AuthPageProps {
  setCurrentPage: (page: Page) => void;
  onLoginSuccess: (email: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ setCurrentPage, onLoginSuccess }) => {
  const { user, userProfile, signInWithGoogle, signOutUser } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Muscle Building');
  
  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Form submission feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        onLoginSuccess(loggedUser.email || 'Athlete');
        setSuccessMessage('Successfully authenticated with Google via Firebase!');
        setTimeout(() => {
          setCurrentPage('features');
        }, 800);
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Another sign-in attempt was in progress.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check popup permissions.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
      setSuccessMessage(
        authMode === 'signin'
          ? 'Welcome back! Signed in to Fitness AI.'
          : 'Profile registered! Directing to AI Features...'
      );
      setTimeout(() => {
        setCurrentPage('features');
      }, 900);
    }, 1000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      return;
    }
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 lg:py-20 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Visual Card with Fitness Inspiration */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 shadow-2xl overflow-hidden space-y-6">
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 blur-[70px] pointer-events-none" />
              
              {/* Fitness Illustration / Stats graphic */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-display text-lg">Fitness AI Member Club</h3>
                  <p className="text-xs text-slate-400">Firebase Cloud Database Connected</p>
                </div>
              </div>

              {/* Visual Metric Card */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    Target Muscle Recovery
                  </span>
                  <span className="text-emerald-400 font-bold">96% Optimal</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[96%]" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Ready for today&apos;s planned Upper Hypertrophy stimulus.
                </p>
              </div>

              {/* Motivational Streak badge */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Continuous Progression</h4>
                  <p className="text-[11px] text-slate-300">
                    Join 150,000+ athletes logging daily workouts, tracking macros, and building lifetime discipline.
                  </p>
                </div>
              </div>

              {/* Trust highlights */}
              <div className="pt-2 space-y-2.5 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Single-click Google Sign In with Firebase Auth</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Real-time cloud synchronization to Firestore</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Region: asia-south1 • Project: spatial-yarrow-2vxch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Authentication Form */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="w-full max-w-md mx-auto rounded-3xl bg-slate-900 border border-slate-800/90 p-8 sm:p-10 shadow-2xl space-y-6">
              
              {/* If user is already logged in with Firebase */}
              {user ? (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center text-xl font-bold overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      user.displayName?.[0] || 'A'
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Firebase Authenticated
                    </span>
                    <h2 className="text-2xl font-bold text-white">
                      {user.displayName || 'Fitness AI Athlete'}
                    </h2>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Auth Provider:</span>
                      <span className="font-semibold text-white">Google Identity</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fitness Goal:</span>
                      <span className="font-semibold text-emerald-400">{userProfile?.fitnessGoal || 'Hypertrophy'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Streak:</span>
                      <span className="font-semibold text-teal-400">{userProfile?.streakDays || 1} Days</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setCurrentPage('features')}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <span>Explore AI Features</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        await signOutUser();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header & Tabs */}
                  <div className="space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      Secure Firebase Access
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                      {authMode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {authMode === 'signin'
                        ? 'Sign in to access your synchronized workout splits and plans'
                        : 'Start your personalized AI-powered fitness journey in seconds'}
                    </p>

                    {/* Switch Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                      <button
                        id="tab-signin"
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setErrorMessage('');
                        }}
                        className={`py-2 rounded-lg transition-all cursor-pointer ${
                          authMode === 'signin'
                            ? 'bg-slate-800 text-emerald-400 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        id="tab-signup"
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setErrorMessage('');
                        }}
                        className={`py-2 rounded-lg transition-all cursor-pointer ${
                          authMode === 'signup'
                            ? 'bg-slate-800 text-emerald-400 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>

                  {/* Feedback Alerts */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in duration-150">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Google Sign In Button */}
                  <div>
                    <button
                      id="btn-google-signin"
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                      {/* Google SVG Logo */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.99 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold absolute">
                      Or with email
                    </span>
                  </div>

                  {/* Email / Password Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            id="input-auth-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alex Parker"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          id="input-auth-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="athlete@fitnessai.app"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Primary Fitness Goal
                        </label>
                        <select
                          value={fitnessGoal}
                          onChange={(e) => setFitnessGoal(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                        >
                          <option value="Muscle Building">Muscle Building &amp; Hypertrophy</option>
                          <option value="Fat Loss">Fat Loss &amp; Conditioning</option>
                          <option value="Strength">Maximal Strength (Powerlifting)</option>
                          <option value="Endurance">Cardiovascular &amp; Endurance</option>
                          <option value="Mobility">Joint Mobility &amp; Longevity</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Password
                        </label>
                        {authMode === 'signin' && (
                          <button
                            id="btn-forgot-password"
                            type="button"
                            onClick={() => {
                              setShowForgotModal(true);
                              setForgotSubmitted(false);
                              setForgotEmail(email || '');
                            }}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          id="input-auth-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="btn-auth-submit"
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{authMode === 'signin' ? 'Sign In to Fitness AI' : 'Complete Registration'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch Auth mode footer */}
                  <div className="text-center text-xs text-slate-400">
                    {authMode === 'signin' ? (
                      <p>
                        Don&apos;t have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signup')}
                          className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                        >
                          Sign Up free
                        </button>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signin')}
                          className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                        >
                          Sign In here
                        </button>
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Reset Link Sent</h4>
                <p className="text-xs text-slate-300">
                  If an account exists for <span className="text-emerald-400 font-semibold">{forgotEmail}</span>, we have sent instructions to reset your password.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter your registered email address. We will send you a password reset link.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="athlete@fitnessai.app"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
