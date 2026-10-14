import { useState } from 'react';
import {
  ExternalLink,
  Globe,
  HelpCircle,
  Leaf,
  MessageSquareQuote,
  Smile,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CollectionManager from '../components/CollectionManager';
import ContentEditor from '../components/ContentEditor';
import { faqService, testimonialService } from '../services/crud';
import { truncateText } from '../utils/format';

const WEB_URL = (import.meta.env.VITE_WEB_URL || 'http://localhost:5173').replace(/\/$/, '');

const scopeOptions = (isSuper, practiceScope) =>
  isSuper
    ? [
        { value: 'main', label: 'Main site' },
        { value: 'ayurveda', label: 'Siddha' },
        { value: 'dental', label: 'Dental' },
      ]
    : [{ value: practiceScope, label: practiceScope === 'dental' ? 'Dental' : 'Siddha' }];

export default function ContentPage() {
  const { isSuper, practiceScope } = useAuth();
  const scopes = scopeOptions(isSuper, practiceScope);

  const tabs = [
    ...(isSuper
      ? [
          {
            key: 'main',
            label: 'Main Website',
            subtitle: 'Home, brand story & doctor spotlight',
            icon: Globe,
            tone: 'main',
          },
        ]
      : []),
    ...(isSuper || practiceScope === 'ayurveda'
      ? [
          {
            key: 'ayurveda',
            label: 'Siddha Hospital',
            subtitle: 'Siddha hero, about & clinic overrides',
            icon: Leaf,
            tone: 'ayurveda',
          },
        ]
      : []),
    ...(isSuper || practiceScope === 'dental'
      ? [
          {
            key: 'dental',
            label: 'Dental Hospital',
            subtitle: 'Dental hero, facilities & clinic overrides',
            icon: Smile,
            tone: 'dental',
          },
        ]
      : []),
    {
      key: 'testimonials',
      label: 'Testimonials',
      subtitle: 'Patient stories & reviews',
      icon: MessageSquareQuote,
      tone: 'neutral',
    },
    {
      key: 'faqs',
      label: 'FAQs',
      subtitle: 'Patient questions & answers',
      icon: HelpCircle,
      tone: 'neutral',
    },
  ];

  const [tab, setTab] = useState(tabs[0].key);

  const testimonialFields = [
    {
      key: 'practiceType',
      label: 'Show on',
      type: 'select',
      required: true,
      options: scopes,
      lockOnEdit: true,
    },
    {
      key: 'name',
      label: 'Patient name / initials',
      required: true,
      max: 80,
      hint: 'Use the name the person agreed to share.',
    },
    {
      key: 'text',
      label: 'Testimonial',
      type: 'textarea',
      required: true,
      min: 10,
      max: 600,
    },
    {
      key: 'rating',
      label: 'Rating (0–5, 0 = hide stars)',
      type: 'number',
      min: 0,
      max: 5,
      required: true,
    },
    {
      key: 'displayOrder',
      label: 'Display order',
      type: 'number',
      min: 0,
      max: 999,
      required: true,
    },
    { key: 'active', label: 'Visible on website', type: 'toggle' },
  ];

  const faqFields = [
    {
      key: 'practiceType',
      label: 'Show on',
      type: 'select',
      required: true,
      options: scopes.filter((s) => s.value !== 'main'),
      lockOnEdit: true,
    },
    { key: 'question', label: 'Question', required: true, min: 5, max: 200 },
    { key: 'answer', label: 'Answer', type: 'textarea', required: true, min: 5, max: 1500 },
    {
      key: 'displayOrder',
      label: 'Display order',
      type: 'number',
      min: 0,
      max: 999,
      required: true,
    },
    { key: 'active', label: 'Visible on website', type: 'toggle' },
  ];

  const activeTabMeta = tabs.find((t) => t.key === tab) || tabs[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-0.5 text-xs font-semibold text-ink-700 mb-2">
            <Sparkles className="size-3.5 text-gold-600" />
            Live Website Content Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
            Website Content Studio
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Edit live text, imagery, lead doctor profiles, and hospital features shown on the public site. Changes publish instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={WEB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-3.5 py-2 text-xs font-semibold text-ink-800 shadow-sm transition hover:bg-ink-50 hover:text-ink-950 focus:ring-2 focus:ring-ink-400"
          >
            <span>View Live Website</span>
            <ExternalLink className="size-3.5 text-ink-500" />
          </a>
        </div>
      </div>

      {/* Segmented Visual Tab Bar */}
      <div
        role="tablist"
        aria-label="Content sections"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 p-1.5 rounded-2xl bg-ink-100/70 border border-ink-200/80 shadow-inner"
      >
        {tabs.map((t) => {
          const isSelected = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-white text-ink-950 shadow-md ring-1 ring-ink-900/5'
                  : 'text-ink-600 hover:bg-white/60 hover:text-ink-900'
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isSelected
                    ? t.tone === 'ayurveda'
                      ? 'bg-ayur-700 text-white shadow-sm'
                      : t.tone === 'dental'
                      ? 'bg-dental-600 text-white shadow-sm'
                      : 'bg-ink-900 text-white shadow-sm'
                    : 'bg-ink-200/60 text-ink-600'
                }`}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight truncate">{t.label}</p>
                <p className="text-[10px] text-ink-400 truncate leading-snug mt-0.5 hidden xl:block">
                  {t.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {['main', 'ayurveda', 'dental'].includes(tab) && (
          <ContentEditor scope={tab} activeTabMeta={activeTabMeta} />
        )}

        {tab === 'testimonials' && (
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-3 border-b border-ink-100 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-ink-100 text-ink-800">
                <MessageSquareQuote className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-950">Patient Testimonials & Reviews</h2>
                <p className="text-xs text-ink-600">
                  Manage quotes and feedback displayed on the homepage, Siddha hospital page, and Dental hospital page.
                </p>
              </div>
            </div>

            <CollectionManager
              service={testimonialService}
              noun="Testimonial"
              plural="Testimonials"
              fields={testimonialFields}
              note="Only publish real feedback that the patient has consented to share."
              blank={{
                practiceType: scopes[0].value,
                name: '',
                text: '',
                rating: 5,
                displayOrder: 1,
                active: true,
              }}
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  render: (r) => (
                    <div>
                      <span className="font-semibold text-ink-900 block">{r.name}</span>
                      <span className="text-[11px] text-ink-500 uppercase tracking-wide">
                        {r.practiceType === 'main'
                          ? 'Main site'
                          : r.practiceType === 'dental'
                          ? 'Dental'
                          : 'Siddha'}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'rating',
                  header: 'Rating',
                  render: (r) => (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gold-700 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-200">
                      ★ {r.rating || 0}/5
                    </span>
                  ),
                },
                {
                  key: 'text',
                  header: 'Testimonial',
                  render: (r) => <span className="text-ink-600 text-xs">{truncateText(r.text, 110)}</span>,
                },
              ]}
            />
          </div>
        )}

        {tab === 'faqs' && (
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-3 border-b border-ink-100 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-ink-100 text-ink-800">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-950">Frequently Asked Questions (FAQs)</h2>
                <p className="text-xs text-ink-600">
                  Manage patient questions and detailed answers shown in the accordions on the Siddha and Dental hospital pages.
                </p>
              </div>
            </div>

            <CollectionManager
              service={faqService}
              noun="FAQ"
              plural="FAQs"
              fields={faqFields}
              blank={{
                practiceType: scopes.find((s) => s.value !== 'main')?.value || 'ayurveda',
                question: '',
                answer: '',
                displayOrder: 1,
                active: true,
              }}
              columns={[
                {
                  key: 'q',
                  header: 'Question',
                  render: (r) => (
                    <div>
                      <span className="font-semibold text-ink-900 block">{truncateText(r.question, 80)}</span>
                      <span className="text-[11px] text-ink-500 uppercase tracking-wide">
                        {r.practiceType === 'dental' ? 'Dental' : 'Siddha'}
                      </span>
                    </div>
                  ),
                },
                { key: 'order', header: 'Display Order', render: (r) => <span className="font-medium text-ink-700">#{r.displayOrder}</span> },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
