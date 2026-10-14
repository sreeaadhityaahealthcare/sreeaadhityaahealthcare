import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  Baby,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Users,
  Wind,
} from "lucide-react";
import { CallButton, WhatsAppButton } from "../common/ContactActions";
import Button from "../ui/Button";
import { Section, SectionHeading } from "../ui/Section";
import { useSite } from "../../contexts/SiteContext";

export const SIDDHA_CLINICAL_DOMAINS = [
  {
    id: "pediatric-healthcare",
    title: "1. Pediatric Healthcare & Child Development",
    icon: Baby,
    summary:
      "Milestone delay, developmental support, and pediatric respiratory immunity.",
    treatments: [
      "Specialized treatments for Autism, Hyperactive Child, and ADHD (Milestone Delay & Developmental Support)",
      "Effective care for recurrent childhood phlegm, chronic cough, and primary complex",
      "Non-surgical management for Adenoids and Tonsillitis",
    ],
  },
  {
    id: "joint-spine-orthopedic",
    title: "2. Joint, Spine & Orthopedic Care",
    icon: ShieldCheck,
    summary:
      "Comprehensive non-surgical solutions for arthritis, disc bulge, and joint mobility.",
    treatments: [
      "Comprehensive treatment for Orthopedic conditions, Knee Joint Pain, and Arthritis",
      "Specialized non-surgical care for Ligament Tears",
      "Treatment for Spinal Cord / Disc Bulge",
    ],
  },
  {
    id: "gastrointestinal-liver",
    title: "3. Gastrointestinal & Liver Health",
    icon: HeartPulse,
    summary:
      "Complete gut healing, non-surgical ano-rectal care, and hepatic restoration.",
    treatments: [
      "Complete care for Gastric Problems, Gastric Ulcers, Duodenal Ulcers, and Irritable Bowel Syndrome (IBS)",
      "Non-surgical, complete cure for Piles & Fistula",
      "Comprehensive management of Liver Disorders, including Alcoholic Liver Cirrhosis and Fatty Liver",
    ],
  },
  {
    id: "dermatology-skin-care",
    title: "4. Dermatology & Skin Care",
    icon: Sparkles,
    summary:
      "Therapies for chronic skin conditions and natural herbal cosmetic solutions.",
    treatments: [
      "Treatment for Psoriasis, Leukoderma (Vitiligo), and Tinea (Fungal) Infections",
      "Natural cosmetic solutions for Hair Fall and Dandruff",
    ],
  },
  {
    id: "respiratory-care",
    title: "5. Respiratory Care",
    icon: Wind,
    summary:
      "Sustained relief and lung strengthening without lifelong inhaler reliance.",
    treatments: [
      "Lifetime relief and management for Bronchial Asthma and Wheezing without reliance on rotacaps or inhalers",
      "Complete care for Allergic Rhinitis",
    ],
  },
  {
    id: "infertility-reproductive",
    title: "6. Infertility & Reproductive Health",
    icon: Users,
    summary:
      "Advanced male & female fertility therapies, IVF support, and non-surgical fibroid care.",
    treatments: [
      "Advanced Siddha treatment for Female & Male Infertility",
      "Specialized care for recurrent IVF Failure and repeated abortions",
      "Non-surgical management for uterine conditions such as Uterine Fibroids and Uterine Hematoma",
    ],
  },
  {
    id: "endocrine-lifestyle",
    title: "7. Endocrine & Lifestyle Disorders",
    icon: Activity,
    summary: "Thyroid normalization and side-effect-free metabolic balance.",
    treatments: [
      "Complete management of Thyroid Disorders (Hypothyroidism and Hyperthyroidism) back to normal stages",
      "Side-effect-free management for Non-Communicable Diseases including Diabetes Mellitus and Hypertension",
    ],
  },
];

export const SIDDHA_HERBAL_PRODUCTS = [
  {
    slug: "detanning-face-cream",
    name: "Detanning Face Cream",
    category: "Herbal Face Creams",
    badge: "Sun Tan & Glow",
    description:
      "Natural herbal face cream for sun tan removal, pigmentation control, and skin rejuvenation without harsh bleaching.",
    price: 360,
    image: "/prod-herbal-blend-1.png",
  },
  {
    slug: "kumkumadi-tailam-face-cream",
    name: "Kumkumadi Tailam Face Cream",
    category: "Herbal Face Creams",
    badge: "Pimple Control & Glow",
    description:
      "Infused with classical Kumkumadi Tailam for active pimple control, blemish reduction, and natural radiant skin glow.",
    price: 490,
    image: "/prod-herbal-powder-1.png",
  },
  {
    slug: "traditional-herbal-shampoo",
    name: "Traditional Herbal Shampoo",
    category: "Hair Care",
    badge: "Hair Fall & Dandruff",
    description:
      "Chemical-free, sulfate-free scalp cleanser with Shikakai, Amla, and Bhringraj for hair fall control and dandruff relief.",
    price: 290,
    image: "/prod-herbal-oil-1.png",
  },
  {
    slug: "traditional-herbal-tooth-powder",
    name: "Traditional Herbal Tooth Powder",
    category: "Dental Care",
    badge: "Gum & Enamel Health",
    description:
      "Classical Siddha dental formulation with clove and babool to strengthen gums, freshen breath, and protect teeth.",
    price: 180,
    image: "/prod-tea-blend-1.png",
  },
];

export function SiddhaDoctorSpotlight() {
  const { content } = useSite();
  const spotlight = content?.main?.doctorSpotlight || {};

  const badge = spotlight.badge || "Siddha Specialist & Lead Consultant";
  const name = spotlight.name || "Dr. M. S. Rajamohan";
  const qualification =
    spotlight.qualification ||
    "BSMS, MD (Siddha) in Forensic Medicine & Toxicology";
  const experienceBadge = spotlight.experienceBadge || "15+ Years";
  const experienceSubtitle =
    spotlight.experienceSubtitle || "Active Practice (2009–Present)";
  const ugQualification =
    spotlight.ugQualification ||
    "BSMS – Velumailu Siddha Medical College (2003 – 2009)";
  const pgQualification =
    spotlight.pgQualification ||
    "MD (Siddha) in Forensic Medicine & Toxicology – National Institute of Siddha (NIS), Tambaram, Chennai\n(Central Government Institution) (2009 – 2012)";
  const bio =
    spotlight.bio ||
    "Practicing actively from 2009 to the present, Dr. M. S. Rajamohan combines traditional Siddha wisdom with advanced clinical care and research-backed expertise. Specializing in non-surgical orthopedic care, pediatric development support, chronic skin disorders, and root-cause gut health.";
  const image = spotlight.image || "/doctor-placeholder-ayurveda-1.png";
  const ctaText =
    spotlight.ctaText || "Book Consultation with Dr. Rajamohan";

  return (
    <Section
      tone="ayurveda"
      className="bg-gradient-to-b from-ayur-50/60 to-white"
    >
      <div className="overflow-hidden rounded-3xl border border-ayur-200/80 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border-4 border-ayur-100 shadow-md">
              <img
                src={image}
                alt={`${name} – Siddha Specialist`}
                className="h-full w-full object-cover object-top"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-xl border border-ayur-200 bg-white p-3.5 shadow-lg">
              <div className="flex items-center gap-2">
                <Award className="size-6 text-ayur-600" />
                <div>
                  <p className="text-xs font-semibold text-ink-900">
                    {experienceBadge}
                  </p>
                  <p className="text-[11px] text-ink-500">
                    {experienceSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ayur-200 bg-ayur-50 px-3.5 py-1 text-xs font-semibold text-ayur-800">
              <Award className="size-3.5 text-ayur-600" />
              {badge}
            </div>
            <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              {name}
            </h2>
            <p className="mt-1 text-base font-semibold text-ayur-700">
              {qualification}
            </p>

            {/* Qualifications Card */}
            <div className="mt-6 space-y-3 rounded-2xl border border-ayur-100 bg-ayur-50/50 p-4 sm:p-5">
              <h3 className="text-xs font-semibold tracking-wider text-ayur-800 uppercase">
                Doctor Profile & Qualifications
              </h3>
              <div className="grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="size-5 shrink-0 text-ayur-600" />
                  <div>
                    <span className="font-semibold text-ink-900 block">
                      Undergraduate (UG):
                    </span>
                    <span className="whitespace-pre-line">{ugQualification}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Building2 className="size-5 shrink-0 text-ayur-600" />
                  <div>
                    <span className="font-semibold text-ink-900 block">
                      Postgraduate (PG):
                    </span>
                    <span className="whitespace-pre-line">{pgQualification}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed whitespace-pre-line text-ink-600 sm:text-base">
              {bio}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                to="/appointments?practice=ayurveda"
                tone="ayurveda"
                size="lg"
              >
                <CalendarCheck className="size-5" aria-hidden="true" />
                {ctaText}
              </Button>
              <CallButton practice="ayurveda" size="lg" />
              <WhatsAppButton practice="ayurveda" size="lg" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function SiddhaClinicalDomains() {
  const { content } = useSite();
  const sec = content?.main?.clinicalDomainsSection || {};

  return (
    <Section id="specialized-services" tone="ayurveda" muted>
      <SectionHeading
        tone="ayurveda"
        align="center"
        eyebrow={sec.eyebrow || "Clinical Specializations"}
        title={sec.title || "Specialized Treatments & Clinical Services"}
        description={
          sec.description ||
          "Comprehensive healthcare protocols led by Dr. M. S. Rajamohan, targeting root causes with evidence-informed Siddha medicine and non-surgical therapies."
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SIDDHA_CLINICAL_DOMAINS.map((domain) => {
          const Icon = domain.icon;
          return (
            <div
              key={domain.id}
              className="group flex flex-col justify-between rounded-2xl border border-ayur-100 bg-white p-6 shadow-sm transition hover:border-ayur-300 hover:shadow-md"
            >
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-ayur-50 text-ayur-700 transition group-hover:bg-ayur-700 group-hover:text-white">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 font-sans text-lg font-bold text-ink-900">
                  {domain.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-ayur-700">
                  {domain.summary}
                </p>

                <ul className="mt-4 space-y-2 text-sm text-ink-600">
                  {domain.treatments.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-ayur-600 mt-0.5" />
                      <span className="leading-snug">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-ink-100">
                <Link
                  to="/appointments?practice=ayurveda"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ayur-700 hover:text-ayur-900"
                >
                  Book treatment consultation
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function SiddhaProductsShowcase() {
  const { content } = useSite();
  const showcase = content?.main?.herbalShowcase || {};

  return (
    <Section tone="ayurveda">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wider text-ayur-600 uppercase">
            {showcase.eyebrow || "Physician Formulations"}
          </p>
          <h2 className="mt-1 font-sans text-2xl font-bold text-ink-900 sm:text-3xl">
            {showcase.title || "Herbal & Cosmetic Products"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-600">
            {showcase.description ||
              "Formulated under Siddha guidance with genuine botanicals for daily skin glow, pimple care, hair strength, and oral health."}
          </p>
        </div>
        <Button to="/shop" variant="outline" tone="ayurveda">
          View All Products <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SIDDHA_HERBAL_PRODUCTS.map((prod) => (
          <Link
            key={prod.slug}
            to={`/shop/product/${prod.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-ayur-100 bg-white transition hover:border-ayur-300 hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden bg-sand-50">
              <img
                src={prod.image}
                alt={prod.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-ayur-800 backdrop-blur-sm">
                {prod.badge}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <span className="text-[11px] font-medium text-ink-500 uppercase tracking-wide">
                {prod.category}
              </span>
              <h3 className="mt-1 font-sans text-base font-bold text-ink-900 group-hover:text-ayur-700">
                {prod.name}
              </h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-600 line-clamp-3">
                {prod.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="font-semibold text-ink-900">
                  ₹{prod.price}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ayur-700">
                  Shop Now{" "}
                  <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
