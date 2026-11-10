import { useRef } from 'react';
import { AlertTriangle, Printer, X } from 'lucide-react';
import Button from '../ui/Button';
import { formatDate, formatPhone, formatShortDate, titleCase } from '../../utils/format';

export default function OpCardPrintView({
  patient,
  onClose,
}) {
  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDental = patient.practiceType === 'dental';
  const allergies = patient.medicalHistory?.allergies;
  const chronic = patient.medicalHistory?.chronicConditions;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/70 p-4 sm:p-6 backdrop-blur-xs flex justify-center items-start">
      {/* Top Floating Control Bar */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/95 px-3 py-2 rounded-xl shadow-lg border border-ink-200 backdrop-blur">
        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5 bg-emerald-700 hover:bg-emerald-800"
        >
          <Printer className="size-4" /> Print OP Card / Case Sheet
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

      {/* Printable Sheet */}
      <div
        id="printable-op-card"
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 sm:p-10 my-8 print:my-0 print:p-6 print:shadow-none print:w-full print:max-w-none text-ink-900 border border-ink-200 print:border-none"
      >
        {/* Header */}
        <div className="border-b-2 border-emerald-800 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icons/logo-main.jpeg"
              alt="Logo"
              className="size-12 rounded-lg border border-ink-200 p-0.5 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xl font-black text-emerald-950 font-serif">
                SREE AADHITYAA HEALTHCARE
              </h1>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Outpatient Department (OPD) Case Sheet & Patient Card
              </p>
              <p className="text-[10px] text-ink-500">
                Siddha Medicine · Advanced Dental Care · Phone: +91 94433 12345
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="border-2 border-dashed border-emerald-700 px-3 py-1 rounded bg-emerald-50">
              <span className="block text-[9px] font-bold text-emerald-900 uppercase">
                OUTPATIENT OP NUMBER
              </span>
              <span className="font-mono text-base font-black text-emerald-950 tracking-wider">
                {patient.opNumber || 'OP-NEW'}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Details Grid */}
        <div className="my-4 border border-ink-300 rounded-lg p-3 text-xs bg-ink-50/30">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Patient Name
              </span>
              <p className="font-bold text-sm text-ink-950">{patient.name}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Age / Gender
              </span>
              <p className="font-semibold text-ink-900">
                {patient.age ? `${patient.age} Yrs` : '—'} /{' '}
                {patient.gender ? titleCase(patient.gender) : '—'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Blood Group
              </span>
              <p className="font-bold text-rose-700">
                {patient.bloodGroup || 'Not Tested'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Registration Date
              </span>
              <p className="font-semibold text-ink-900">
                {patient.createdAt ? formatShortDate(patient.createdAt) : formatDate(new Date().toISOString())}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Mobile Number
              </span>
              <p className="font-medium text-ink-900">{formatPhone(patient.phone)}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Department
              </span>
              <p className="font-bold text-emerald-800">
                {patient.practiceType === 'dental'
                  ? 'Dental Speciality'
                  : patient.practiceType === 'both'
                  ? 'Siddha & Dental Integrated'
                  : 'Siddha Medicine'}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Address
              </span>
              <p className="font-medium text-ink-900 truncate">
                {[
                  patient.address?.street,
                  patient.address?.city,
                  patient.address?.district,
                  patient.address?.pincode,
                ]
                  .filter(Boolean)
                  .join(', ') || 'Tamil Nadu'}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Warnings Alert if any */}
        {(allergies || chronic) && (
          <div className="mb-4 rounded border border-rose-300 bg-rose-50/70 p-2.5 text-xs text-rose-900">
            {allergies && (
              <p>
                <strong>⚠️ Known Allergies:</strong> {allergies}
              </p>
            )}
            {chronic && (
              <p className="mt-0.5">
                <strong>🩺 Systemic Conditions:</strong> {chronic}
              </p>
            )}
          </div>
        )}

        {/* Doctor Consultation History Log on the Card */}
        <div className="border border-ink-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-ink-100 font-bold text-ink-800 border-b border-ink-300">
              <tr>
                <th className="py-2 px-3 w-24">Date & Token</th>
                <th className="py-2 px-3 w-28">Doctor</th>
                <th className="py-2 px-3 w-32">Vitals</th>
                <th className="py-2 px-3">Complaints, Clinical Findings & Diagnosis</th>
                <th className="py-2 px-3 w-32">Treatment / Advice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {(patient.visits || []).slice(0, 5).map((v, i) => (
                <tr key={v.id || i} className="align-top">
                  <td className="py-2.5 px-3">
                    <span className="font-bold">{formatShortDate(v.visitDate)}</span>
                    <div className="text-[10px] text-ink-500">Token #{v.tokenNumber}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-ink-800">
                    Dr. {v.doctorName || 'Doctor'}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-ink-600">
                    {v.vitals?.bp && <div>BP: {v.vitals.bp}</div>}
                    {v.vitals?.pulse && <div>P: {v.vitals.pulse} bpm</div>}
                    {v.vitals?.weight && <div>Wt: {v.vitals.weight} kg</div>}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-ink-900">{v.chiefComplaints}</p>
                    {v.finalDiagnosis && (
                      <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                        Dx: {v.finalDiagnosis}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[11px]">
                    <p className="font-medium text-ink-800">{v.treatmentGiven || 'Consultation'}</p>
                    {v.nextFollowUp && (
                      <p className="text-ink-500 mt-0.5">Review: {formatShortDate(v.nextFollowUp)}</p>
                    )}
                  </td>
                </tr>
              ))}

              {/* Blank rows for physical write-in during OPD visits */}
              {Array.from({ length: Math.max(3, 5 - (patient.visits?.length || 0)) }).map((_, i) => (
                <tr key={`blank-${i}`} className="h-14">
                  <td className="py-2 px-3 border-r border-ink-200"></td>
                  <td className="py-2 px-3 border-r border-ink-200"></td>
                  <td className="py-2 px-3 border-r border-ink-200"></td>
                  <td className="py-2 px-3 border-r border-ink-200"></td>
                  <td className="py-2 px-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions to Patient */}
        <div className="mt-4 pt-3 border-t border-ink-200 flex items-center justify-between text-[10px] text-ink-500">
          <p>Please bring this Outpatient (OP) Card for all subsequent visits and consultations.</p>
          <p>Hospital Helpline: +91 94433 12345</p>
        </div>
      </div>
    </div>
  );
}
