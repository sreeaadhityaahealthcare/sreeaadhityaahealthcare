import { useSearchParams } from 'react-router-dom';
import AppointmentForm from '../components/appointment/AppointmentForm';
import { PageHero } from '../components/ui/Section';
import { BRAND } from '../config/site';
import Seo from '../components/ui/Seo';

export default function AppointmentsPage() {
  const [params] = useSearchParams();
  const practice = params.get('practice') === 'dental' ? 'dental' : 'ayurveda';
  const service = params.get('service') || '';
  const doctor = params.get('doctor') || '';

  return (
    <>
      <Seo
        title="Book Doctor Appointment — Siddha & Dental Healthcare"
        description="Book your appointment with our Siddha physicians or dental specialists online. Fast booking for Siddha consultations, dental check-ups, and treatments."
        path="/appointments"
        keywords="Book Siddha doctor appointment, dental appointment online, Dr. M. S. Rajamohan appointment, clinic consultation Gobichettipalayam, doctor booking Tamil Nadu"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Book Appointment", path: "/appointments" },
        ]}
      />
      <PageHero eyebrow="Appointments" title="Book an appointment" description="Choose a practice, treatment and doctor, and tell us your preferred date and time. Our team will contact you to confirm." />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <AppointmentForm key={`${practice}-${service}-${doctor}`} practice={practice} initialServiceId={service} initialDoctorId={doctor} />
        </div>
      </div>
    </>
  );
}
