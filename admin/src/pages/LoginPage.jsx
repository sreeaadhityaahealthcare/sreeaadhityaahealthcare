import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Leaf, Smile } from 'lucide-react';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { useAuth } from '../contexts/AuthContext';
import { requestPasswordReset } from '../services/authService';
import { getErrorMessage, logError } from '../utils/errors';
import { v } from '../utils/validators';

export default function LoginPage() {
  const { status, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (status === 'ready' || status === 'unauthorized') return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  const errors = {
    email: v.email(form.email, { required: true }),
    password: form.password ? '' : 'Password is required.',
  };
  const show = (f) => (touched[f] ? errors[f] : '');
  const bind = (f) => ({ value: form[f], onChange: (e) => setForm((s) => ({ ...s, [f]: e.target.value })), onBlur: () => setTouched((t) => ({ ...t, [f]: true })), error: show(f) });

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setTouched({ email: true, password: true });
    setError(''); setInfo('');
    if (errors.email || errors.password) return;
    setBusy(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      logError('login', err);
      setError(getErrorMessage(err, 'Could not sign in. Please try again.'));
      setBusy(false);
    }
  };

  const reset = async () => {
    setError(''); setInfo('');
    if (errors.email) { setTouched((t) => ({ ...t, email: true })); return; }
    try {
      await requestPasswordReset(form.email);
    } catch (err) {
      logError('reset', err); // don't reveal whether the account exists
    }
    setInfo('If an account exists for that email, a password reset link has been sent.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3 text-white">
          <img
            src="/icons/logo-main.jpeg"
            alt="Sree Aadhityaa"
            className="size-12 rounded-xl bg-white p-1 object-contain shadow-md shrink-0"
            width={48}
            height={48}
          />
          <div className="leading-tight"><p className="text-lg font-semibold">SREE AADHITYAA</p><p className="text-[11px] tracking-wider text-white/60 uppercase">Integrated Siddha and Dental Healthcare · Admin</p></div>
        </div>

        <form onSubmit={submit} noValidate className="rounded-xl bg-white p-6 shadow-xl">
          <h1 className="text-xl font-semibold text-ink-900">Sign in</h1>
          <p className="mt-1 mb-5 text-sm text-ink-600">Staff access only.</p>
          <div className="space-y-4">
            <TextField label="Email" type="email" autoComplete="username" required {...bind('email')} />
            <TextField label="Password" type="password" autoComplete="current-password" required {...bind('password')} />
          </div>
          {error && <p role="alert" className="mt-4 rounded-md border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">{error}</p>}
          {info && <p role="status" className="mt-4 rounded-md bg-ayur-50 px-3 py-2.5 text-sm text-ayur-800">{info}</p>}
          <Button type="submit" size="lg" loading={busy} className="mt-5 w-full">{busy ? 'Signing in…' : 'Sign in'}</Button>
          <button type="button" onClick={reset} className="mt-4 w-full text-center text-sm font-medium text-dental-700 hover:underline">Forgot password?</button>
          <p className="mt-3 text-center text-sm text-ink-600">Need access? <Link to="/signup" className="font-medium text-dental-700 hover:underline">Request an account</Link></p>
        </form>
      </div>
    </div>
  );
}
