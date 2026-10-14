import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { BRAND, PRACTICES } from "../../config/site";
import { toneFor } from "../../config/theme";
import { useSite } from "../../contexts/SiteContext";
import { useServices } from "../../hooks/useCatalog";
import { ServiceCard } from "../practice/Cards";
import Button from "../ui/Button";
import { Section, SectionHeading } from "../ui/Section";
import { AsyncBlock } from "../common/Sections";
import { CardGridSkeleton, DemoNotice } from "../ui/States";

const ICONS = {
  stethoscope: Stethoscope,
  heart: HeartHandshake,
  building: Building2,
  user: UserRound,
  shield: ShieldCheck,
};

const SLIDE_DURATION = 4000; // ms

function getHeroSlides(content) {
  const mainHero = content?.main?.hero || {};
  const ayurHero = content?.ayurveda?.hero || {};
  const dentalHero = content?.dental?.hero || {};

  return [
    {
      id: "main",
      practice: "main",
      tabLabel: "Integrated Care",
      eyebrow: mainHero.eyebrow || "Siddha & Dental Healthcare",
      title: mainHero.title || "SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE",
      subtitle:
        mainHero.subtitle ||
        "Integrated Siddha and Dental care under one trusted roof, with online appointments and authentic herbal wellness products.",
      image: mainHero.image || "/home-hero.png",
      alt: "Sree Aadhityaa Integrated Siddha and Dental Healthcare hospital entrance and clinical suites",
      badgeText: "Integrated Holistic & Dental Care",
      highlights: [
        "Root-Cause Siddha Therapies",
        "Advanced Multispeciality Dentistry",
        "Online Appointments & Store",
      ],
      primaryBtn: {
        to: "/appointments",
        label: "Book Appointment",
        tone: "ayurveda",
      },
      secondaryBtn: {
        to: "/about",
        label: "About Us",
        tone: "main",
      },
      pillBg: "bg-ink-900 text-white shadow-md shadow-ink-950/20",
      pillInactive: "text-ink-700 hover:bg-ink-100/70",
      badgeStyle: "bg-ink-100 text-ink-900 border-ink-200",
      gradientAura: "from-ink-600/10 via-ink-500/5 to-transparent",
    },
    {
      id: "ayurveda",
      practice: "ayurveda",
      tabLabel: "Siddha Hospital",
      eyebrow: "Traditional Siddha Medicine",
      title: ayurHero.title || "Root-Cause Healing with Classical Siddha Care",
      subtitle:
        ayurHero.subtitle ||
        "Personalised consultations with Siddha physicians, authentic traditional therapies, and time-tested herbal remedies in a tranquil clinical setting.",
      image: ayurHero.image || "/icons/logo-siddha.jpeg",
      alt: "Shree Aadhitya Siddha Hospital official healthcare emblem",
      badgeText: "Authentic Holistic Care",
      highlights: [
        "Physician-Guided Therapies",
        "Traditional Healing Programmes",
        "Herbal Pharmacy Online",
      ],
      primaryBtn: {
        to: "/siddha",
        label: "Explore Siddha",
        tone: "ayurveda",
      },
      secondaryBtn: {
        to: "/appointments?practice=ayurveda",
        label: "Book Appointment",
        tone: "ayurveda",
      },
      pillBg: "bg-ayur-700 text-white shadow-md shadow-ayur-900/20",
      pillInactive: "text-ink-700 hover:bg-ayur-100/70",
      badgeStyle: "bg-ayur-100 text-ayur-800 border-ayur-200",
      gradientAura: "from-ayur-600/10 via-ayur-500/5 to-transparent",
    },
    {
      id: "dental",
      practice: "dental",
      tabLabel: "Dental Hospital",
      eyebrow: "Advanced Multispeciality Dentistry",
      title: dentalHero.title || "Gentle, Modern Dental Care Designed for Every Smile",
      subtitle:
        dentalHero.subtitle ||
        "Comprehensive dental healthcare from routine preventive check-ups and gentle root canals to cosmetic smile design and implants in a spotless environment.",
      image: dentalHero.image || "/icons/logo-dental.jpeg",
      alt: "Shree Aadhitya Dental Hospital official healthcare emblem",
      badgeText: "Modern Advanced Clinic",
      highlights: [
        "Rigorous Multi-Step Sterilisation",
        "Child-Friendly Dental Care",
        "Cosmetic & Implant Specialists",
      ],
      primaryBtn: {
        to: "/dental",
        label: "Explore Dental",
        tone: "dental",
      },
      secondaryBtn: {
        to: "/appointments?practice=dental",
        label: "Book Appointment",
        tone: "dental",
      },
      pillBg: "bg-dental-600 text-white shadow-md shadow-dental-900/20",
      pillInactive: "text-ink-700 hover:bg-dental-100/70",
      badgeStyle: "bg-dental-100 text-dental-800 border-dental-200",
      gradientAura: "from-dental-600/10 via-dental-500/5 to-transparent",
    },
  ];
}

function getSlideIcon(practice) {
  if (practice === "ayurveda") return Leaf;
  if (practice === "dental") return Smile;
  return Sparkles;
}

export function HomeHero() {
  const { content } = useSite();
  const heroSlides = getHeroSlides(content);
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const safeIdx = activeIdx >= heroSlides.length ? 0 : activeIdx;
  const activeSlide = heroSlides[safeIdx];
  const Icon = getSlideIcon(activeSlide.practice);

  const nextSlide = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setActiveIdx(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  }, [heroSlides.length]);

  const goToSlide = (idx) => {
    setActiveIdx(idx);
  };

  // Auto-scrolling: changes automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [safeIdx, heroSlides.length]);

  // Touch gesture handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-sand-100 transition-colors duration-700"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Care practices overview"
    >
      {/* Background ambient radial aura */}
      <div
        className={`pointer-events-none absolute -top-24 left-1/2 -z-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b ${activeSlide.gradientAura} blur-3xl transition-all duration-700`}
        aria-hidden="true"
      />

      <div className="container-page relative z-10 py-10 sm:py-14 lg:py-20">
        {/* Top Header: Practice Selector Tabs & Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Practice Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Practice slides"
            className="inline-flex w-fit items-center rounded-full border border-ink-200/80 bg-white/80 p-1.5 backdrop-blur-md"
          >
            {heroSlides.map((slide, idx) => {
              const isActive = idx === safeIdx;
              const TabIcon = getSlideIcon(slide.practice);
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => goToSlide(idx)}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-300 sm:px-5 sm:text-sm ${
                    isActive ? slide.pillBg : slide.pillInactive
                  }`}
                >
                  <TabIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{slide.tabLabel}</span>
                  {isActive && (
                    <span className="hidden sm:inline-block size-1.5 rounded-full bg-white/80 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Carousel controls: Prev & Next */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={prevSlide}
              className="flex size-9 items-center justify-center rounded-full border border-ink-200 bg-white/90 text-ink-700 shadow-sm transition hover:bg-white hover:text-ink-900 focus:ring-2 focus:ring-ink-300"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="flex size-9 items-center justify-center rounded-full border border-ink-200 bg-white/90 text-ink-700 shadow-sm transition hover:bg-white hover:text-ink-900 focus:ring-2 focus:ring-ink-300"
              aria-label="Next slide"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Hero Main Content Grid */}
        <div
          key={activeSlide.id}
          className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"
        >
          {/* Left Text & CTAs */}
          <div className="flex flex-col">
            {/* Eyebrow badge */}
            <div className="mb-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${activeSlide.badgeStyle}`}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {activeSlide.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl leading-[1.12] font-semibold text-balance text-ink-950 sm:text-4xl lg:text-[2.85rem]">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-700 sm:text-lg">
              {activeSlide.subtitle}
            </p>

            {/* Highlight pills */}
            <ul className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium text-ink-800 sm:text-sm">
              {activeSlide.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200/70 bg-white/70 px-3 py-1.5 backdrop-blur-sm"
                >
                  <Check
                    className="size-3.5 text-gold-600 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button
                to={activeSlide.primaryBtn.to}
                tone={activeSlide.primaryBtn.tone}
                size="lg"
                className="group shadow-md"
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {activeSlide.primaryBtn.label}
                <ArrowRight
                  className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              <Button
                to={activeSlide.secondaryBtn.to}
                variant="outline"
                tone={activeSlide.secondaryBtn.tone}
                size="lg"
              >
                <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
                {activeSlide.secondaryBtn.label}
              </Button>
            </div>
          </div>

          {/* Right Image Display Card */}
          <div className="relative flex items-center justify-center">
            <div className="group relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white p-2.5 shadow-xl ring-1 ring-ink-900/5">
              {activeSlide.practice === "main" ? (
                <>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-100">
                    <img
                      src={activeSlide.image}
                      alt={activeSlide.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
                  </div>

                  {/* Floating feature badge on main banner */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-ink-900 text-white">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                          {activeSlide.tabLabel}
                        </p>
                        <p className="text-sm font-semibold text-ink-900">
                          {activeSlide.badgeText}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={activeSlide.primaryBtn.to}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink-900 hover:text-ink-700 hover:underline"
                    >
                      <span>Learn more</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative aspect-square w-full max-w-[360px] mx-auto overflow-hidden rounded-2xl bg-white p-6 sm:p-8 flex items-center justify-center">
                    <img
                      src={activeSlide.image}
                      alt={activeSlide.alt}
                      className="size-full object-contain drop-shadow-sm transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                    />
                  </div>

                  {/* Feature badge beneath square logo card */}
                  <div className="mt-2.5 flex items-center justify-between rounded-xl border border-ink-100 bg-sand-50/90 p-3.5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-10 items-center justify-center rounded-lg ${
                          activeSlide.practice === "ayurveda"
                            ? "bg-ayur-700 text-white"
                            : "bg-dental-600 text-white"
                        }`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                          {activeSlide.tabLabel}
                        </p>
                        <p className="text-sm font-semibold text-ink-900">
                          {activeSlide.badgeText}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={activeSlide.primaryBtn.to}
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        activeSlide.practice === "ayurveda"
                          ? "text-ayur-700 hover:text-ayur-800"
                          : "text-dental-700 hover:text-dental-800"
                      } hover:underline`}
                    >
                      <span>Learn more</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PRACTICE_POINTS = {
  ayurveda: [
    "Led by Dr. M. S. Rajamohan, MD (Siddha) NIS",
    "Specialized pediatric, spine, joint & gastrointestinal care",
    "Traditional herbal & cosmetic products online",
  ],
  dental: [
    "Check-ups and preventive care",
    "Restorative and cosmetic treatments",
    "Care for children and adults",
  ],
};

function PracticeCard({ practice, tagline, points }) {
  const p = PRACTICES[practice];
  const t = toneFor(practice);
  const Icon = practice === "ayurveda" ? Leaf : Smile;
  const listPoints = points && points.length > 0 ? points : PRACTICE_POINTS[practice];
  return (
    <article
      className={`flex flex-col rounded-2xl border p-7 sm:p-9 ${t.softBorder} ${t.soft}`}
    >
      <span
        className={`mb-6 flex size-14 items-center justify-center rounded-xl ${t.solid.split(" hover")[0]}`}
      >
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h3 className="text-2xl font-semibold sm:text-3xl">{p.name}</h3>
      <p className="mt-2 text-ink-600">{tagline || p.tagline}</p>
      <ul className="mt-6 space-y-2.5 text-sm text-ink-700">
        {listPoints.map((point) => (
          <li key={point} className="flex gap-2.5">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${t.text}`}
              aria-hidden="true"
            />
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to={p.path} tone={practice}>
          Visit {practice === "ayurveda" ? "Siddha" : "Dental"}{" "}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Button
          to={`/appointments?practice=${practice}`}
          variant="outline"
          tone={practice}
        >
          Book
        </Button>
      </div>
    </article>
  );
}

export function PracticeSelection() {
  const { content } = useSite();
  const po = content?.main?.practicesOverview || {};
  const parsePoints = (val, fallback) => {
    if (!val) return fallback;
    if (Array.isArray(val)) return val;
    return val.split("\n").map((s) => s.trim()).filter(Boolean);
  };

  const siddhaPoints = parsePoints(po.siddhaPoints, PRACTICE_POINTS.ayurveda);
  const dentalPoints = parsePoints(po.dentalPoints, PRACTICE_POINTS.dental);

  return (
    <Section id="practices">
      <SectionHeading
        align="center"
        eyebrow={po.eyebrow || "Our practices"}
        title={po.title || "Choose the care you need"}
        description={po.subtitle || "Two hospitals with their own doctors, treatments and appointment booking."}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <PracticeCard practice="ayurveda" tagline={po.siddhaTagline} points={siddhaPoints} />
        <PracticeCard practice="dental" tagline={po.dentalTagline} points={dentalPoints} />
      </div>
    </Section>
  );
}

function ServiceColumn({ practice }) {
  const q = useServices(practice);
  const featured = q.data
    ? [...q.data]
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
        .slice(0, 3)
    : q.data;
  const t = toneFor(practice);
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3
          className={`font-sans text-sm font-semibold tracking-wide uppercase ${t.text}`}
        >
          {PRACTICES[practice].shortName}
        </h3>
        <Link
          to={PRACTICES[practice].servicesPath}
          className={`text-sm font-medium ${t.text} hover:underline`}
        >
          View all
        </Link>
      </div>
      <AsyncBlock
        query={{ ...q, data: featured }}
        skeleton={
          <CardGridSkeleton count={3} cols="grid-cols-1" imageClass="h-28" />
        }
      >
        {(items) => (
          <div className="grid gap-4">
            {items.map((s) => (
              <ServiceCard key={s.id} service={s} compact />
            ))}
          </div>
        )}
      </AsyncBlock>
    </div>
  );
}

export function ServicesPreview() {
  return (
    <Section muted>
      <SectionHeading
        eyebrow="Treatments"
        title="Popular services"
        description="A selection of treatments from both hospitals."
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <ServiceColumn practice="ayurveda" />
        <ServiceColumn practice="dental" />
      </div>
    </Section>
  );
}

export function WhyChoose() {
  const { content } = useSite();
  return (
    <Section>
      <SectionHeading
        align="center"
        eyebrow={`Why ${BRAND.short}`}
        title="Care built around you"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {content.main.whyChoose.map((item) => {
          const Icon = ICONS[item.icon] || ShieldCheck;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-ink-100 bg-white p-6"
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-ink-100 text-ink-800">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-sans text-base font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
