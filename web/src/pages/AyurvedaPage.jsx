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

export default function AyurvedaPage() {
  const { content } = useSite();
  return (
    <>
      <Seo
        title="Siddha Hospital"
        description={content.ayurveda.hero.subtitle}
        path="/siddha"
        image="/og-ayurveda.png"
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
