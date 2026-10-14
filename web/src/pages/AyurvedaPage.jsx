import ContactSection from "../components/common/ContactSection";
import {
  DoctorsSection,
  StorePreview,
  TestimonialsSection,
  TreatmentsSection,
  FaqSection,
} from "../components/common/Sections";
import {
  AppointmentSection,
  Disclaimer,
  PracticeAbout,
  PracticeHero,
} from "../components/practice/PracticeSections";
import { SiddhaClinicalDomains } from "../components/practice/SiddhaSpecialistSection";
import Seo from "../components/ui/Seo";
import { useSite } from "../contexts/SiteContext";
import { generateFaqSchema } from "../utils/seoSchemas";

export default function AyurvedaPage() {
  const { content } = useSite();
  const faqSchema = generateFaqSchema(content.ayurveda?.faqs);

  return (
    <>
      <Seo
        title="Siddha Hospital — Root-Cause Healing with Classical Siddha Care"
        description={
          content.ayurveda.hero.subtitle ||
          "Shree Aadhitya Siddha Hospital — Led by Dr. M. S. Rajamohan MD (Siddha) NIS. Specialised pediatric, spine, joint, and gastrointestinal care in Tamil Nadu."
        }
        path="/siddha"
        image="/og-ayurveda.png"
        keywords="Siddha hospital Tamil Nadu, Dr. M. S. Rajamohan, MD Siddha NIS, pediatric Siddha, spine disorders, joint care, gastrointestinal health, herbal medicine, authentic Siddha treatment Gobichettipalayam"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Siddha Hospital", path: "/siddha" },
        ]}
        schema={faqSchema ? [faqSchema] : []}
      />
      <PracticeHero practice="ayurveda" />
      <PracticeAbout practice="ayurveda" />
      <SiddhaClinicalDomains />
      <TreatmentsSection
        practice="ayurveda"
        muted
        description="Traditional Siddha consultations and therapies. Suitability is assessed by the physician."
      />
      <DoctorsSection practice="ayurveda" title="Our Siddha doctors" />
      <AppointmentSection practice="ayurveda" />
      <StorePreview muted={false} />
      <TestimonialsSection scope="ayurveda" muted />
      <FaqSection practice="ayurveda" />
      <ContactSection practice="ayurveda" muted />
      <div className="container-page pb-12">
        <Disclaimer />
      </div>
    </>
  );
}
