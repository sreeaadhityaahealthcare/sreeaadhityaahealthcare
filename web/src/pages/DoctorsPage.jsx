import { useSearchParams } from "react-router-dom";
import { AsyncBlock } from "../components/common/Sections";
import { DoctorCard } from "../components/practice/Cards";
import { PageHero } from "../components/ui/Section";
import { BRAND } from "../config/site";
import Seo from "../components/ui/Seo";
import { DemoNotice, EmptyState } from "../components/ui/States";
import { toneFor } from "../config/theme";
import { useDoctors } from "../hooks/useCatalog";
import { generateDoctorSchema } from "../utils/seoSchemas";

const FILTERS = [
  { key: "", label: "All doctors" },
  { key: "ayurveda", label: "Siddha" },
  { key: "dental", label: "Dental" },
];

export default function DoctorsPage() {
  const [params, setParams] = useSearchParams();
  const practice = ["ayurveda", "dental"].includes(params.get("practice"))
    ? params.get("practice")
    : "";
  const q = useDoctors(practice || undefined);
  const doctorSchemas = (q.data || []).map((doc) => generateDoctorSchema(doc)).filter(Boolean);

  return (
    <>
      <Seo
        title="Our Doctors & Medical Specialists — Siddha & Dental Healthcare"
        description="Meet our team of experienced Siddha physicians and dental surgeons led by Dr. M. S. Rajamohan MD (Siddha) NIS at Sree Aadhityaa Healthcare."
        path="/doctors"
        keywords="Siddha doctors Tamil Nadu, Dr. M. S. Rajamohan, dental surgeons Gobichettipalayam, dentist Erode, pediatric Siddha specialist, authentic Siddha doctor appointment"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Our Doctors", path: "/doctors" },
        ]}
        schema={doctorSchemas}
      />
      <PageHero
        eyebrow="Our team"
        title="Our doctors"
        description="Qualified practitioners across our Siddha and dental hospitals."
      />
      <div className="container-page py-12">
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter doctors by practice"
        >
          {FILTERS.map((f) => {
            const active = practice === f.key;
            const t = toneFor(f.key || "main");
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setParams(f.key ? { practice: f.key } : {})}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? `${t.solid.split(" hover")[0]} border-transparent` : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <AsyncBlock
          query={q}
          empty={
            <EmptyState
              title="Doctor profiles coming soon"
              message="Our doctors’ profiles will be listed here shortly."
            />
          }
        >
          {(items) => (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          )}
        </AsyncBlock>
      </div>
    </>
  );
}
