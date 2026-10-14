import {
  HomeHero,
  PracticeSelection,
  ServicesPreview,
  WhyChoose,
} from "../components/home/HomeSections";
import {
  AppointmentBand,
  DoctorsSection,
  StorePreview,
  TestimonialsSection,
} from "../components/common/Sections";
import ContactSection from "../components/common/ContactSection";
import { BRAND } from "../config/site";
import Seo from "../components/ui/Seo";
import { useSite } from "../contexts/SiteContext";
import { generateClinicSchema, generateWebSiteSchema } from "../utils/seoSchemas";

export default function HomePage() {
  const { content, settings } = useSite();
  const cta = content.main.appointmentCta;
  const clinicSchema = generateClinicSchema(settings);
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <Seo
        title="Integrated Siddha & Dental Healthcare"
        description="Sree Aadhityaa Integrated Healthcare — Expert Siddha treatments led by Dr. M. S. Rajamohan MD (Siddha) NIS, advanced dental care, online doctor appointments, and authentic Siddha herbal products."
        path="/"
        image="/og-main.png"
        schema={[clinicSchema, websiteSchema]}
      />
      <HomeHero />
      <PracticeSelection />
      <DoctorsSection
        limit={4}
        eyebrow="Medical & Dental Specialists"
        title="Experienced Siddha & Dental Doctors"
        showAll
      />
      <ServicesPreview />
      <WhyChoose />
      <AppointmentBand title={cta.title} text={cta.text} />
      <StorePreview />
      <TestimonialsSection scope="main" />
      <ContactSection muted />
    </>
  );
}
