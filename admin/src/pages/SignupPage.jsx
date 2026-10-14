import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2, ChevronRight, Leaf, Loader2, Smile,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signUp } from '../services/authService';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, v } from '../utils/validators';
import { ROLES } from '../config/constants';

/* ─────────────────────────────  Sub-components  ────────────────────────────── */

function RoleCard({ role, selected, onSelect }) {
  const isDental = role === ROLES.DENTAL;
  const accent = isDental ? '#2563eb' : '#16a34a';
  const lightBg = isDental ? 'rgba(37,99,235,0.08)' : 'rgba(22,163,74,0.08)';
  const borderColor = isDental ? 'rgba(37,99,235,0.35)' : 'rgba(22,163,74,0.35)';
  const icon = isDental
    ? <Smile style={{ color: accent }} size={28} strokeWidth={1.8} />
    : <Leaf style={{ color: accent }} size={28} strokeWidth={1.8} />;
  const title = isDental ? 'Dental Admin' : 'Siddha Admin';
  const desc = isDental
    ? 'Manage dental clinic appointments, doctors, dental services, and patient records.'
    : 'Manage Siddha treatments, herbal products, practitioners, and wellness programs.';
  const tags = isDental
    ? ['Appointments', 'Doctors', 'Treatments', 'Patients']
    : ['Siddha Treatments', 'Herbal Products', 'Practitioners', 'Wellness'];

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      aria-pressed={selected}
      style={{
        background: selected ? lightBg : 'rgba(255,255,255,0.04)',
        border: `2px solid ${selected ? borderColor : 'rgba(255,255,255,0.1)'}`,
        boxShadow: selected ? `0 0 0 3px ${accent}22, 0 4px 20px ${accent}18` : 'none',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(.34,1.56,.64,1)',
      }}
      className="relative w-full rounded-2xl p-5 text-left cursor-pointer focus:outline-none"
    >
      {selected && (
        <span style={{ position: 'absolute', top: 12, right: 12 }}>
          <CheckCircle2 size={20} style={{ color: accent }} />
        </span>
      )}
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 52, height: 52, borderRadius: 14, background: lightBg,
          border: `1.5px solid ${borderColor}`, marginBottom: 14,
        }}
      >
        {icon}
      </span>
      <p className="text-white font-semibold text-[15px] mb-1">{title}</p>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11, padding: '3px 9px', borderRadius: 999,
              background: `${accent}1a`, color: accent,
              border: `1px solid ${accent}30`, fontWeight: 600,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

function InputField({ label, id, error, hint, ...props }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
        {label}
      </label>
      <input
        id={id}
        style={{
          display: 'block', width: '100%', height: 44, padding: '0 14px',
          borderRadius: 10, fontSize: 14,
          background: 'rgba(255,255,255,0.07)',
          border: `1.5px solid ${error ? '#f87171' : 'rgba(255,255,255,0.13)'}`,
          color: '#fff', outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(99,179,237,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,179,237,0.15)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#f87171' : 'rgba(255,255,255,0.13)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
      {error && <p style={{ marginTop: 5, fontSize: 12, color: '#fca5a5' }} role="alert">{error}</p>}
      {!error && hint && <p style={{ marginTop: 5, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{hint}</p>}
    </div>
  );
}

/* ─────────────────────────────  Success screen  ────────────────────────────── */

function SuccessScreen({ role }) {
  const isDental = role === ROLES.DENTAL;
  const roleLabel = isDental ? 'Dental Admin' : 'Siddha Admin';
  const accent = isDental ? '#60a5fa' : '#4ade80';
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: isDental ? 'rgba(37,99,235,0.18)' : 'rgba(22,163,74,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        border: `2px solid ${accent}50`,
      }}>
        <CheckCircle2 size={36} style={{ color: accent }} />
      </div>
      <p className="text-white font-semibold text-xl mb-2">Request sent!</p>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.65 }}>
        Your <strong style={{ color: accent }}>{roleLabel}</strong> access request has been submitted.
        A super admin will review it and activate your account. You'll be able to sign in once approved.
      </p>
      <Link
        to="/login"
        style={{
          display: 'inline-block', marginTop: 28, padding: '10px 32px',
          borderRadius: 10, background: 'rgba(255,255,255,0.1)',
          color: '#fff', fontWeight: 600, fontSize: 14,
          border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.18)'; }}
        onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
      >
        Back to sign in
      </Link>
    </div>
  );
}

/* ─────────────────────────────  Main component  ────────────────────────────── */

export default function SignupPage() {
  const { status } = useAuth();

  // Step 1: role selection  |  Step 2: account details  |  done: success
  const [step, setStep] = useState(1);
  const [requestedRole, setRequestedRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (status === 'ready' || status === 'unauthorized') return <Navigate to="/" replace />;

  const errors = {
    name: v.text(form.name, { label: 'Full name', min: 2, max: 100, required: true }),
    email: v.email(form.email, { required: true }),
    password: form.password.length < 8 ? 'Password must be at least 8 characters.' : '',
    confirm: form.confirm !== form.password ? 'Passwords do not match.' : '',
  };
  const bind = (f) => ({
    value: form[f],
    onChange: (e) => setForm((s) => ({ ...s, [f]: e.target.value })),
    error: submitted ? errors[f] : '',
  });

  const goToStep2 = () => {
    if (!requestedRole) return;
    setStep(2);
    setSubmitted(false);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setError('');
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      await signUp({ ...form, requestedRole });
      setDone(true);
    } catch (err) {
      logError('signup', err);
      setError(getErrorMessage(err, 'Could not create your account. Please try again.'));
      setBusy(false);
    }
  };

  /* ── shared card wrapper ── */
  const isDental = requestedRole === ROLES.DENTAL;
  const accentGrad = isDental
    ? 'linear-gradient(135deg,#1e3a8a 0%,#0f172a 60%)'
    : 'linear-gradient(135deg,#14532d 0%,#0f172a 60%)';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at top left, ${isDental && requestedRole ? '#1e3a8a55' : requestedRole ? '#14532d55' : '#1e293b55'} 0%, transparent 60%), #0a0f1e`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 16px', transition: 'background 0.6s',
      }}
    >
      {/* Subtle animated grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 32 }}>
          <img
            src="/icons/logo-main.jpeg"
            alt="Sree Aadhityaa"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#fff',
              padding: 4,
              objectFit: 'contain',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              flexShrink: 0,
            }}
          />
          <div style={{ lineHeight: 1.25 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>SREE AADHITYAA</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Integrated Siddha &amp; Dental Healthcare · Admin
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '32px 32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}>

          {done ? (
            <SuccessScreen role={requestedRole} />
          ) : step === 1 ? (
            /* ── Step 1: Choose role ── */
            <div>
              <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                Request admin access
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, marginBottom: 24 }}>
                Choose the department you'll be administering. A super admin will review and approve your account.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                <RoleCard
                  role={ROLES.DENTAL}
                  selected={requestedRole === ROLES.DENTAL}
                  onSelect={setRequestedRole}
                />
                <RoleCard
                  role={ROLES.AYURVEDA}
                  selected={requestedRole === ROLES.AYURVEDA}
                  onSelect={setRequestedRole}
                />
              </div>

              <button
                type="button"
                onClick={goToStep2}
                disabled={!requestedRole}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', height: 46, borderRadius: 12,
                  background: requestedRole
                    ? (isDental ? '#2563eb' : '#16a34a')
                    : 'rgba(255,255,255,0.1)',
                  color: '#fff', fontWeight: 600, fontSize: 15,
                  border: 'none', cursor: requestedRole ? 'pointer' : 'not-allowed',
                  opacity: requestedRole ? 1 : 0.5,
                  transition: 'all 0.2s',
                  boxShadow: requestedRole ? `0 4px 20px ${isDental ? '#2563eb' : '#16a34a'}55` : 'none',
                }}
              >
                Continue
                <ChevronRight size={18} />
              </button>

              <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Already have access?{' '}
                <Link to="/login" style={{ color: '#93c5fd', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            /* ── Step 2: Account details ── */
            <div>
              {/* Back + role badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setSubmitted(false); setError(''); }}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, padding: '4px 12px', color: 'rgba(255,255,255,0.7)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <span style={{
                  padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: isDental ? 'rgba(37,99,235,0.2)' : 'rgba(22,163,74,0.2)',
                  color: isDental ? '#93c5fd' : '#86efac',
                  border: `1px solid ${isDental ? 'rgba(37,99,235,0.4)' : 'rgba(22,163,74,0.4)'}`,
                }}>
                  {isDental ? '🦷 Dental Admin' : '🌿 Siddha Admin'}
                </span>
              </div>

              <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                Create your account
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, marginBottom: 24 }}>
                Fill in your details. Your account will be activated once a super admin approves it.
              </p>

              <form onSubmit={submit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <InputField
                    id="signup-name"
                    label="Full name"
                    type="text"
                    autoComplete="name"
                    placeholder="Dr. Firstname Lastname"
                    {...bind('name')}
                  />
                  <InputField
                    id="signup-email"
                    label="Work email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    {...bind('email')}
                  />
                  <InputField
                    id="signup-password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    hint="Minimum 8 characters."
                    {...bind('password')}
                  />
                  <InputField
                    id="signup-confirm"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    {...bind('confirm')}
                  />
                </div>

                {error && (
                  <div role="alert" style={{
                    marginTop: 18, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5', fontSize: 13, lineHeight: 1.5,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', height: 46, borderRadius: 12, marginTop: 24,
                    background: isDental ? '#2563eb' : '#16a34a',
                    color: '#fff', fontWeight: 600, fontSize: 15,
                    border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                    opacity: busy ? 0.7 : 1,
                    boxShadow: `0 4px 20px ${isDental ? '#2563eb' : '#16a34a'}55`,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {busy && <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />}
                  {busy ? 'Creating account…' : 'Request access'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  Already have access?{' '}
                  <Link to="/login" style={{ color: '#93c5fd', fontWeight: 600, textDecoration: 'none' }}>
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Step indicator dots */}
        {!done && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            {[1, 2].map((s) => (
              <span
                key={s}
                style={{
                  width: s === step ? 20 : 6, height: 6, borderRadius: 3,
                  background: s === step ? (isDental ? '#2563eb' : '#16a34a') : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keyframes for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
