import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Leaf,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { CONTENT_DEFAULTS, CONTENT_SCHEMA } from '../config/contentSchema';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { getSiteContent, mergeDefaults, saveSiteContent } from '../services/contentService';
import { deleteImageByUrl } from '../services/storageService';
import Button from './ui/Button';
import { SelectField, TextAreaField, TextField } from './ui/FormField';
import ImageUploader from './ui/ImageUploader';
import { ErrorState, PageSkeleton } from './ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { getIn, setIn, v } from '../utils/validators';

const WEB_URL = (import.meta.env.VITE_WEB_URL || 'http://localhost:5173').replace(/\/$/, '');

const SECTION_ICONS = {
  sparkles: Sparkles,
  building: Building2,
  award: Award,
  activity: Activity,
  leaf: Leaf,
  shield: ShieldCheck,
  calendar: Calendar,
  book: BookOpen,
  phone: Phone,
  smile: Smile,
};

const collectImages = (schema, data) =>
  schema.flatMap((sec) => {
    const value = getIn(data, sec.path, sec.type === 'list' ? [] : {});
    const rows = sec.type === 'list' ? value : [value];
    return rows.flatMap((row) =>
      sec.fields.filter((f) => f.type === 'image').map((f) => row?.[f.key]).filter(Boolean),
    );
  });

function validateField(f, value) {
  const label = f.label.replace(/\s*\(.*\)/, '');
  if (f.type === 'phone') return v.phone(value);
  if (f.type === 'email') return v.email(value);
  if (f.type === 'url') return v.url(value);
  if (f.type === 'image' || f.type === 'select') return '';
  return v.text(value, { label, max: f.max || 200, required: f.required });
}

function Field({ field, value, error, onChange, folder, originals, toast }) {
  const common = {
    label: field.label,
    value: value ?? '',
    error,
    hint: field.hint,
    required: field.required,
  };

  if (field.type === 'textarea') {
    return (
      <TextAreaField
        {...common}
        rows={field.rows || 3}
        maxLength={field.max}
        className="sm:col-span-2"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <SelectField {...common} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectField>
    );
  }

  if (field.type === 'image') {
    return (
      <div className="sm:col-span-2">
        <ImageUploader
          label={field.label}
          folder={folder}
          value={value ? [value] : []}
          originalUrls={originals}
          onChange={(urls) => onChange(urls[0] || '')}
          onNotify={(m, t) => toast[t === 'error' ? 'error' : 'success'](m)}
        />
      </div>
    );
  }

  return (
    <TextField
      {...common}
      maxLength={field.max}
      type={field.type === 'email' ? 'email' : 'text'}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Schema-driven editor for siteContent/{scope}. Effective (default-merged) values are shown and saved. */
export default function ContentEditor({ scope, activeTabMeta }) {
  const { user } = useAuth();
  const toast = useToast();
  const q = useAsync(() => getSiteContent(scope), [scope]);

  if (q.loading) return <PageSkeleton />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;

  return (
    <EditorForm
      key={scope}
      scope={scope}
      remote={q.data || {}}
      user={user}
      toast={toast}
      tabMeta={activeTabMeta}
    />
  );
}

function EditorForm({ scope, remote, user, toast, tabMeta }) {
  const schema = CONTENT_SCHEMA[scope];
  const initial = useMemo(() => mergeDefaults(CONTENT_DEFAULTS[scope], remote), [scope, remote]);
  const originals = useMemo(() => collectImages(schema, initial), [schema, initial]);

  const [data, setData] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(schema[0]?.id || schema[0]?.path);

  // Check if form is dirty compared to initial
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initial);
  }, [data, initial]);

  const errorFor = (sec, field, rowIndex) => {
    const value =
      sec.type === 'list'
        ? data[sec.path]?.[rowIndex]?.[field.key]
        : getIn(data, `${sec.path}.${field.key}`);
    return validateField(field, value);
  };

  const allErrors = schema
    .flatMap((sec) =>
      sec.type === 'list'
        ? (data[sec.path] || []).flatMap((_, i) => sec.fields.map((f) => errorFor(sec, f, i)))
        : sec.fields.map((f) => errorFor(sec, f)),
    )
    .filter(Boolean);

  const save = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (allErrors.length) {
      toast.error('Please resolve the highlighted validation errors.');
      return;
    }
    setBusy(true);
    try {
      const payload = Object.fromEntries(
        schema.map((sec) => [sec.path, data[sec.path] ?? (sec.type === 'list' ? [] : {})]),
      );
      await saveSiteContent(scope, payload, user);
      collectImages(schema, initial)
        .filter((u) => !collectImages(schema, payload).includes(u))
        .forEach(deleteImageByUrl);
      toast.success('Changes successfully published live to the website.');
    } catch (err) {
      logError('content-save', err);
      toast.error(getErrorMessage(err, 'Could not save the website content.'));
    } finally {
      setBusy(false);
    }
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save(e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, allErrors, busy]);

  const updateList = (sec, fn) =>
    setData((d) => ({ ...d, [sec.path]: fn([...(d[sec.path] || [])]) }));

  const scrollToSection = (secId) => {
    setActiveSectionId(secId);
    const el = document.getElementById(`section-${secId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <form onSubmit={save} noValidate className="relative pb-24 space-y-6">
      {/* Quick-Jump Section Navigation Strip */}
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-white/95 backdrop-blur-md border-b border-ink-200/80 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider shrink-0 mr-1">
          Jump to:
        </span>
        {schema.map((sec) => {
          const secId = sec.id || sec.path;
          const SecIcon = SECTION_ICONS[sec.icon] || Sparkles;
          const isActive = activeSectionId === secId;
          return (
            <button
              key={secId}
              type="button"
              onClick={() => scrollToSection(secId)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-ink-900 text-white shadow-xs'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200 hover:text-ink-900'
              }`}
            >
              <SecIcon className="size-3.5 shrink-0" />
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Section Cards */}
      <div className="space-y-6">
        {schema.map((sec, idx) => {
          const secId = sec.id || sec.path;
          const SecIcon = SECTION_ICONS[sec.icon] || Sparkles;

          return (
            <div
              key={sec.path}
              id={`section-${secId}`}
              className="scroll-mt-32 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition hover:border-ink-300"
            >
              {/* Section Header */}
              <div className="mb-6 flex flex-col gap-2 border-b border-ink-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                      scope === 'ayurveda'
                        ? 'bg-ayur-100 text-ayur-800'
                        : scope === 'dental'
                        ? 'bg-dental-100 text-dental-800'
                        : 'bg-ink-100 text-ink-800'
                    }`}
                  >
                    <SecIcon className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink-400">0{idx + 1}</span>
                      <h2 className="text-lg font-bold text-ink-950">{sec.title}</h2>
                    </div>
                    {sec.description && (
                      <p className="mt-1 text-xs text-ink-600 max-w-2xl leading-relaxed">
                        {sec.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section Badge & Live Link */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {sec.badge && (
                    <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-700 border border-ink-200">
                      {sec.badge}
                    </span>
                  )}
                  {sec.previewUrl && (
                    <a
                      href={`${WEB_URL}${sec.previewUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                      title="Preview this section on the live website"
                    >
                      <span>Preview</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Section Form Fields */}
              {sec.type === 'list' ? (
                <div className="space-y-4">
                  {(data[sec.path] || []).map((row, i) => (
                    <div
                      key={i}
                      className="group relative rounded-xl border border-ink-200 bg-ink-50/40 p-4 transition-all hover:border-ink-300 hover:bg-white hover:shadow-xs"
                    >
                      <div className="mb-3 flex items-center justify-between border-b border-ink-200/60 pb-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-800 uppercase tracking-wider">
                          <span className="flex size-5 items-center justify-center rounded-full bg-ink-200 text-[10px] text-ink-700 font-bold">
                            {i + 1}
                          </span>
                          {sec.itemLabel} #{i + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="!text-red-600 hover:!bg-red-50 text-xs"
                          onClick={() =>
                            updateList(sec, (list) => list.filter((_, idx) => idx !== i))
                          }
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {sec.fields.map((f) => (
                          <Field
                            key={f.key}
                            field={f}
                            value={row[f.key]}
                            error={submitted ? errorFor(sec, f, i) : ''}
                            folder={`site/${scope}`}
                            originals={originals}
                            toast={toast}
                            onChange={(val) =>
                              updateList(sec, (list) => {
                                list[i] = { ...list[i], [f.key]: val };
                                return list;
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {(data[sec.path] || []).length < sec.max && (
                    <button
                      type="button"
                      onClick={() =>
                        updateList(sec, (list) => [
                          ...list,
                          Object.fromEntries(
                            sec.fields.map((f) => [
                              f.key,
                              f.type === 'select' ? f.options[0].value : '',
                            ]),
                          ),
                        ])
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 py-3.5 text-xs font-semibold text-ink-700 transition hover:border-ink-500 hover:bg-ink-50 hover:text-ink-950"
                    >
                      <Plus className="size-4" />
                      <span>Add {sec.itemLabel}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {sec.fields.map((f) => (
                    <Field
                      key={f.key}
                      field={f}
                      value={getIn(data, `${sec.path}.${f.key}`)}
                      error={submitted ? errorFor(sec, f) : ''}
                      folder={`site/${scope}`}
                      originals={originals}
                      toast={toast}
                      onChange={(val) => setData((d) => setIn(d, `${sec.path}.${f.key}`, val))}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Save & Publish Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:left-64 border-t border-ink-200/90 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2.5">
            {isDirty ? (
              <span className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes pending
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="size-4 text-emerald-600" />
                All changes saved & live
              </span>
            )}

            {isDirty && (
              <button
                type="button"
                onClick={() => setData(initial)}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-800 underline"
              >
                <RotateCcw className="size-3" />
                Discard
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="lg"
              loading={busy}
              className="group shadow-md flex items-center gap-2"
            >
              <Save className="size-4" />
              <span>Save & Publish Changes</span>
              <kbd className="hidden sm:inline-block rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono tracking-wide text-white">
                Ctrl + S
              </kbd>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
