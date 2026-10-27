import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Globe2, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Box, 
  Compass, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('shriyathakre6@gmail.com');
  const [password, setPassword] = useState('astramesh2026');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create account');
      } else {
        setSuccessMessage('Account created successfully! Redirecting...');
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Please provide both email and password');
        return;
      }
      const res = await login(email, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    login(demoEmail, demoPass, true);
  };

  return (
    <div className="min-h-screen w-screen flex bg-geo-bg text-geo-text-main font-sans selection:bg-geo-teal/20">
      {/* Left Column: Drone-to-3D Visual Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-geo-primary via-[#1D3E61] to-[#162F4A] p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric background grid & contour accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-geo-teal/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 top-1/4 w-80 h-80 rounded-full bg-geo-secondary/30 blur-2xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-geo-teal to-cyan-300 p-0.5 shadow-teal-glow flex items-center justify-center">
            <div className="w-full h-full bg-geo-primary rounded-[10px] flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider text-white">
              ASTRAMESH<span className="text-cyan-300">3D</span>
            </span>
            <div className="text-[11px] font-mono tracking-wider text-cyan-200">
              SMART INDIA HACKATHON • SIH26158
            </div>
          </div>
        </div>

        {/* Center Graphic & Mission Statement */}
        <div className="relative z-10 my-auto py-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono text-cyan-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Single-Pass Drone Photogrammetry Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white max-w-lg">
            One Flight. One Video.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300">
              One Measurable 3D World.
            </span>
          </h1>

          <p className="text-sm text-slate-200 leading-relaxed max-w-md">
            Transform continuous aerial UAV video footage into metric-grade, georeferenced 3D digital twins with AI depth estimation, COLMAP Structure-from-Motion, and zero-fabrication validation.
          </p>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-2 gap-3 pt-4 max-w-md">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-geo-teal/30 flex items-center justify-center text-cyan-300 mb-2">
                <Camera className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Sub-Pixel Sampling</div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Laplacian variance blur rejection & dynamic exposure filtering.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-geo-secondary/40 flex items-center justify-center text-cyan-200 mb-2">
                <Compass className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">EPSG:4326 Datum</div>
              <p className="text-[11px] text-slate-300 leading-snug">
                7-parameter Helmert similarity georeferencing to WGS 84.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-mono">
          <span>AstraMesh3D Platform v2.4</span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Govt & Defense Standard</span>
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header Branding */}
          <div className="lg:hidden flex items-center gap-3 pb-2">
            <div className="w-10 h-10 rounded-xl bg-geo-primary text-white flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-geo-primary">ASTRAMESH<span className="text-geo-teal">3D</span></span>
              <div className="text-[10px] font-mono text-geo-text-sub">One Flight. One Video. One Measurable 3D World.</div>
            </div>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl font-bold text-geo-text-main">
              {mode === 'login' ? 'Sign In to Mission Console' : 'Create Geospatial Account'}
            </h2>
            <p className="text-xs text-geo-text-sub mt-1">
              {mode === 'login' 
                ? 'Enter your credentials to access the 3D Digital Twin and telemetry dashboard.' 
                : 'Register a new operator profile for aerial photogrammetry surveys.'}
            </p>
          </div>

          {/* Tab Switcher: Login vs Register */}
          <div className="flex p-1 bg-geo-blue-light rounded-xl border border-geo-border">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'login' 
                  ? 'bg-white text-geo-primary shadow-geo-sm border border-geo-border' 
                  : 'text-geo-text-sub hover:text-geo-text-main'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'register' 
                  ? 'bg-white text-geo-primary shadow-geo-sm border border-geo-border' 
                  : 'text-geo-text-sub hover:text-geo-text-main'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-geo-text-main mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-geo-text-sub absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Shriya Thakre"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-geo-border bg-white text-xs text-geo-text-main placeholder:text-geo-text-muted focus:outline-none focus:border-geo-primary focus:ring-2 focus:ring-geo-primary/10 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-geo-text-main mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-geo-text-sub absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-geo-border bg-white text-xs text-geo-text-main placeholder:text-geo-text-muted focus:outline-none focus:border-geo-primary focus:ring-2 focus:ring-geo-primary/10 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-geo-text-main">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-geo-text-sub absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-geo-border bg-white text-xs text-geo-text-main placeholder:text-geo-text-muted focus:outline-none focus:border-geo-primary focus:ring-2 focus:ring-geo-primary/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-geo-text-sub hover:text-geo-text-main transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-geo-text-main mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-geo-text-sub absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-geo-border bg-white text-xs text-geo-text-main placeholder:text-geo-text-muted focus:outline-none focus:border-geo-primary focus:ring-2 focus:ring-geo-primary/10 transition"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-geo-text-sub">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-geo-border text-geo-teal focus:ring-geo-teal/20"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-geo-teal font-medium hover:underline cursor-pointer">
                  Forgot credentials?
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-geo-md transition disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Authenticate & Enter' : 'Register Operator'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Helper for SIH Presentation */}
          <div className="pt-2 border-t border-geo-border space-y-2.5">
            <div className="text-[11px] font-mono text-geo-text-sub text-center uppercase tracking-wider">
              Quick Demonstration Access
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('shriyathakre6@gmail.com', 'astramesh2026')}
                className="p-2 rounded-lg bg-geo-blue-light hover:bg-geo-blue-light/80 border border-geo-border text-geo-primary text-[11px] font-bold text-left transition"
              >
                <div className="font-semibold">Lead Scientist</div>
                <div className="text-[10px] text-geo-text-sub font-normal">Shriya Thakre</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('evaluator@sih.gov.in', 'sih2026')}
                className="p-2 rounded-lg bg-geo-mint-light hover:bg-geo-mint-light/80 border border-geo-teal/30 text-geo-teal text-[11px] font-bold text-left transition"
              >
                <div className="font-semibold">SIH Evaluator</div>
                <div className="text-[10px] text-geo-text-sub font-normal">Jury Review Mode</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
