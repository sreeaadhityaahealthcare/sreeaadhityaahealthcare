import { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  Pill,
  Printer,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';
import Button from '../ui/Button';
import { PracticeBadge } from '../ui/Badges';
import { formatDate, formatPhone, titleCase } from '../../utils/format';

export default function PrescriptionPrintView({
  prescription,
  onClose,
}) {
  const printRef = useRef(null);

  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDental = prescription.practiceType === 'dental';
  const practiceTitle = isDental ? 'Dental Speciality Clinic' : 'Siddha Medical Clinic';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/70 p-4 sm:p-6 backdrop-blur-xs flex justify-center items-start">
      {/* Top Floating Control Bar (Hidden during print) */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/95 px-3 py-2 rounded-xl shadow-lg border border-ink-200 backdrop-blur">
        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5 bg-emerald-700 hover:bg-emerald-800"
        >
          <Printer className="size-4" /> Print / Save as PDF
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Printable Sheet (Standard A4 proportion) */}
      <div
        id="printable-prescription"
        ref={printRef}
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 sm:p-10 my-8 print:my-0 print:p-6 print:shadow-none print:w-full print:max-w-none text-ink-900 border border-ink-200 print:border-none"
      >
        {/* Hospital Letterhead Header */}
        <div className="border-b-2 border-emerald-700 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/icons/logo-main.jpeg"
                alt="Sree Aadhityaa"
                className="size-14 rounded-xl border border-ink-200 p-0.5 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 uppercase font-serif">
                  SREE AADHITYAA HEALTHCARE
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-800 uppercase">
                  {isDental ? 'Multi-Speciality Dental Care & Implant Center' : 'Integrated Siddha Hospital & Research Clinic'}
                </p>
                <p className="text-[11px] text-ink-500 mt-0.5">
                  Ayurveda · Siddha · Dental Specialties · Holistic Wellness
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-ink-600 leading-tight">
              <p className="font-semibold text-ink-800">Hospital OPD</p>
              <p>Main Road, Kumbakonam</p>
              <p>Tamil Nadu — 612001</p>
              <p className="font-mono mt-1 font-semibold text-emerald-800">
                +91 94433 12345
              </p>
            </div>
          </div>
        </div>

        {/* Doctor & Patient Metadata Grid */}
        <div className="my-5 rounded-lg border border-ink-200 bg-ink-50/40 p-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4">
            <div>
              <span className="text-ink-500 block text-[10px] uppercase font-semibold">
                Patient Name
              </span>
              <span className="font-bold text-sm text-ink-950">
                {prescription.patientName}
              </span>
            </div>

            <div>
              <span className="text-ink-500 block text-[10px] uppercase font-semibold">
                Outpatient (OP) Number
              </span>
              <span className="font-mono font-bold text-sm text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 inline-block">
                {prescription.opNumber || 'OP-RECORD'}
              </span>
            </div>

            <div>
              <span className="text-ink-500 block text-[10px] uppercase font-semibold">
                Age & Gender
              </span>
              <span className="font-semibold text-ink-900">
                {prescription.patientAge ? `${prescription.patientAge} Yrs` : '—'} /{' '}
                {prescription.patientGender ? titleCase(prescription.patientGender) : '—'}
              </span>
            </div>

            <div>
              <span className="text-ink-500 block text-[10px] uppercase font-semibold">
                Date
              </span>
              <span className="font-bold text-ink-900">
                {formatDate(prescription.date)}
              </span>
            </div>

            <div>
              <span className="text-ink-500 block text-[10px] uppercase font-semibold">
                Phone Number
              </span>
              <span className="font-medium text-ink-900">
                {formatPhone(prescription.patientPhone)}
              </span>
            </div>

            <div>
              <span className="text-ink-500 block text-[10px] uppercase font-semibold">
                Prescription ID
              </span>
              <span className="font-mono font-semibold text-ink-700">
                {prescription.prescriptionNumber}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-ink-500 block text-[10px] uppercase font-semibold">
                Consulting Physician / Surgeon
              </span>
              <span className="font-bold text-ink-900">
                Dr. {prescription.doctorName || 'Doctor'}{' '}
                {prescription.doctorQualification ? `(${prescription.doctorQualification})` : ''}
                {prescription.doctorRegNo ? ` · Reg: ${prescription.doctorRegNo}` : ''}
              </span>
            </div>

            {prescription.diagnosis && (
              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-ink-200">
                <span className="text-ink-500 font-semibold uppercase text-[10px] mr-2">
                  Clinical Diagnosis:
                </span>
                <span className="font-bold text-emerald-950">
                  {prescription.diagnosis}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rx Symbol */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-serif italic font-black text-2xl text-emerald-900 leading-none">
            ℞
          </span>
          <span className="text-[10px] tracking-widest text-ink-400 uppercase font-semibold">
            Prescription / Medication Chart
          </span>
        </div>

        {/* Formatted Tablets & Medications Table */}
        <div className="border border-ink-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-emerald-900 text-white font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Medicine / Tablet Name</th>
                <th className="py-2.5 px-3 w-28">Dosage & Freq</th>
                <th className="py-2.5 px-3 w-36">Timing & Vehicle</th>
                <th className="py-2.5 px-3 w-20">Duration</th>
                <th className="py-2.5 px-3 w-16">Qty</th>
                <th className="py-2.5 px-3">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {(prescription.items || []).map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-ink-50/50' : 'bg-white'}>
                  <td className="py-2.5 px-3 font-mono font-medium text-ink-400">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-ink-950 text-sm">
                      {item.name}
                    </span>
                    <div className="text-[11px] text-ink-500">
                      {titleCase(item.type)} {item.strength ? `· ${item.strength}` : ''}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">
                    {item.frequency || '1-0-1'}
                    <div className="text-[10px] font-sans font-normal text-ink-600">
                      {item.dosage || '1 dose'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-ink-900">
                      {item.timing ? titleCase(item.timing) : 'After Food'}
                    </span>
                    {item.anupanam && (
                      <div className="text-[10px] text-emerald-800 font-medium">
                        {item.anupanam}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-ink-700 font-medium">
                    {item.duration || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-ink-900 font-semibold">
                    {item.totalQuantity || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-ink-600 italic text-[11px]">
                    {item.instructions || 'As advised'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dietary Advice & Pathiyam */}
        {prescription.generalAdvice && (
          <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50/50 p-3.5 text-xs text-amber-950">
            <span className="font-bold uppercase tracking-wider text-amber-900 block mb-1">
              Dietary Guidelines & Clinical Advice (Pathiyam / Post-Procedure Care):
            </span>
            <p className="leading-relaxed whitespace-pre-line font-medium">
              {prescription.generalAdvice}
            </p>
          </div>
        )}

        {/* Follow-up Note & Doctor's Signature Area */}
        <div className="mt-8 pt-4 border-t border-ink-200 flex items-end justify-between text-xs">
          <div>
            {prescription.followUpDate ? (
              <p className="font-semibold text-ink-900">
                📅 Next Review / Follow-up:{' '}
                <strong className="text-emerald-900 font-bold underline">
                  {formatDate(prescription.followUpDate)}
                </strong>
              </p>
            ) : (
              <p className="text-ink-500">
                Review if symptoms persist or as required.
              </p>
            )}
            <p className="text-[10px] text-ink-400 mt-1">
              Valid for dispensing at hospital pharmacy.
            </p>
          </div>

          <div className="text-center w-52">
            <div className="h-14 border-b border-ink-400 flex items-end justify-center pb-1">
              {/* Space for doctor seal / sign */}
            </div>
            <p className="font-bold text-ink-900 mt-1.5">
              Dr. {prescription.doctorName || 'Attending Physician'}
            </p>
            <p className="text-[10px] text-ink-500">
              {prescription.doctorQualification || 'Consultant Physician / Surgeon'}
            </p>
            <p className="text-[10px] font-mono text-ink-400">
              {prescription.doctorRegNo ? `Reg No: ${prescription.doctorRegNo}` : 'Authorized Medical Signatory'}
            </p>
          </div>
        </div>

        {/* Clean Hospital Footer */}
        <div className="mt-8 pt-3 border-t-2 border-emerald-700 text-center text-[10px] text-ink-500 leading-tight">
          <p className="font-medium text-ink-700">
            SREE AADHITYAA HEALTHCARE · SIDDHA & DENTAL MULTI-SPECIALITY HOSPITAL
          </p>
          <p>
            Wish you a speedy recovery · For emergency appointments / pharmacy assistance call:{' '}
            <strong className="text-emerald-800">+91 94433 12345</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
