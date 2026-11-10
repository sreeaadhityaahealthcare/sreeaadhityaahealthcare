import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Heart,
  History,
  MapPin,
  Pill,
  Phone,
  Plus,
  Printer,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import Button, { IconButton } from '../ui/Button';
import { Badge, PracticeBadge, StatusBadge } from '../ui/Badges';
import { Card } from '../ui/DataDisplay';
import { formatCurrency, formatDate, formatPhone, formatShortDate, formatTime, formatTimestamp, titleCase } from '../../utils/format';

export default function PatientDetailsView({
  patient,
  onNewVisit,
  onWritePrescription,
  onEdit,
  onPrintCard,
  onViewPrescription,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);

  if (!patient) return null;

  const copyOpNumber = () => {
    if (patient.opNumber) {
      navigator.clipboard?.writeText(patient.opNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const visits = patient.visits || [];
  const prescriptions = patient.prescriptions || [];
  const appointments = patient.appointments || [];

  const medHistory = patient.medicalHistory || {};
  const hasAllergies = Boolean(medHistory.allergies && medHistory.allergies.trim());
  const hasChronic = Boolean(medHistory.chronicConditions && medHistory.chronicConditions.trim());

  return (
    <div className="space-y-6">
      {/* Top Banner: Prominent Patient Overview */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm font-semibold text-xl">
              {patient.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="size-3.5" />
                  OLD / REGISTERED PATIENT
                </span>
                <PracticeBadge practice={patient.practiceType} />
                <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                  {patient.gender ? titleCase(patient.gender) : 'Patient'}
                  {patient.age ? ` · ${patient.age} yrs` : ''}
                </span>
                {patient.bloodGroup && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                    🩸 {patient.bloodGroup}
                  </span>
                )}
              </div>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
                {patient.name}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-600">
                <div className="flex items-center gap-1 font-mono font-semibold text-ink-900 bg-white px-2 py-0.5 rounded border border-ink-200">
                  <span>OP: {patient.opNumber || 'Not assigned'}</span>
                  <button
                    type="button"
                    onClick={copyOpNumber}
                    title="Copy OP Number"
                    className="text-ink-400 hover:text-ink-700 ml-1"
                  >
                    <Copy className="size-3" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-600 font-sans">Copied!</span>}
                </div>
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5 text-ink-400" />
                  {formatPhone(patient.phone)}
                </span>
                {patient.alternatePhone && (
                  <span className="text-ink-500">
                    Alt: {formatPhone(patient.alternatePhone)}
                  </span>
                )}
                {patient.email && <span>{patient.email}</span>}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPrintCard?.(patient)}
              className="gap-1.5"
            >
              <Printer className="size-3.5" /> OP Card
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit?.(patient)}
              className="gap-1.5"
            >
              <Edit className="size-3.5" /> Edit Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onWritePrescription?.(patient)}
              className="gap-1.5 border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100"
            >
              <Pill className="size-3.5" /> Write Prescription
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNewVisit?.(patient)}
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800"
            >
              <Stethoscope className="size-3.5" /> New OP Consultation
            </Button>
          </div>
        </div>

        {/* Critical Alerts Banner (Allergies / Systemic Warnings) */}
        {(hasAllergies || hasChronic) && (
          <div className="mt-4 flex flex-wrap gap-2.5 rounded-lg border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-800 shrink-0">
              <AlertTriangle className="size-4 text-amber-600" />
              Medical Alert:
            </div>
            {hasAllergies && (
              <div className="rounded bg-rose-100/90 px-2 py-0.5 font-medium text-rose-800">
                ⚠️ Allergies: <span className="font-semibold">{medHistory.allergies}</span>
              </div>
            )}
            {hasChronic && (
              <div className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-900">
                🩺 Chronic Conditions: <span className="font-semibold">{medHistory.chronicConditions}</span>
              </div>
            )}
            {medHistory.currentMedications && (
              <div className="rounded bg-amber-100/80 px-2 py-0.5 text-amber-900">
                Daily Meds: {medHistory.currentMedications}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Internal Navigation Tabs */}
      <div className="border-b border-ink-200">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 border-b-2 py-2.5 text-sm transition-colors ${
              activeTab === 'summary'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <User className="size-4" />
            Complete Patient Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visits')}
            className={`flex items-center gap-2 border-b-2 py-2.5 text-sm transition-colors ${
              activeTab === 'visits'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <Stethoscope className="size-4" />
            OP Consultations ({visits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prescriptions')}
            className={`flex items-center gap-2 border-b-2 py-2.5 text-sm transition-colors ${
              activeTab === 'prescriptions'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <Pill className="size-4" />
            Prescriptions & Tablets ({prescriptions.length})
          </button>
          {appointments.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 border-b-2 py-2.5 text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <Calendar className="size-4" />
              Online Bookings ({appointments.length})
            </button>
          )}
        </nav>
      </div>

      {/* TAB 1: SUMMARY / COMPLETE PATIENT DETAILS */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Demographics & Contact Card */}
          <Card title="Demographics & Contact Information">
            <dl className="divide-y divide-ink-100 text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-ink-500">Full Name</dt>
                <dd className="font-semibold text-ink-900">{patient.name}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-ink-500">Outpatient (OP) Number</dt>
                <dd className="font-mono font-bold text-ink-900">{patient.opNumber || '—'}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-ink-500">Practice / Department</dt>
                <dd><PracticeBadge practice={patient.practiceType} /></dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-ink-500">Age & Gender</dt>
                <dd className="text-ink-900 font-medium">
                  {patient.age ? `${patient.age} years` : '—'} · {patient.gender ? titleCase(patient.gender) : '—'}
                </dd>
              </div>
              {patient.dob && (
                <div className="flex justify-between py-2">
                  <dt className="text-ink-500">Date of Birth</dt>
                  <dd className="text-ink-900">{formatDate(patient.dob)}</dd>
                </div>
              )}
              <div className="flex justify-between py-2">
                <dt className="text-ink-500">Blood Group</dt>
                <dd className="font-bold text-rose-700">{patient.bloodGroup || 'Not specified'}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-ink-500">Primary Mobile</dt>
                <dd className="font-medium text-ink-900">{formatPhone(patient.phone)}</dd>
              </div>
              {patient.alternatePhone && (
                <div className="flex justify-between py-2">
                  <dt className="text-ink-500">Alternate Phone</dt>
                  <dd className="text-ink-900">{formatPhone(patient.alternatePhone)}</dd>
                </div>
              )}
              {patient.email && (
                <div className="flex justify-between py-2">
                  <dt className="text-ink-500">Email Address</dt>
                  <dd className="text-ink-900">{patient.email}</dd>
                </div>
              )}
              <div className="py-2">
                <dt className="text-ink-500 mb-1">Residential Address</dt>
                <dd className="text-ink-900 font-medium">
                  {[
                    patient.address?.street,
                    patient.address?.city,
                    patient.address?.district,
                    patient.address?.state,
                    patient.address?.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'No address registered'}
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-ink-500 mb-1">Emergency Contact</dt>
                <dd className="text-ink-900">
                  {patient.emergencyContact?.name ? (
                    <span className="font-medium">
                      {patient.emergencyContact.name}{' '}
                      {patient.emergencyContact.relation ? `(${patient.emergencyContact.relation})` : ''} ·{' '}
                      {formatPhone(patient.emergencyContact.phone)}
                    </span>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Clinical Profile & Medical History */}
          <Card title="Clinical Profile & Medical History">
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                  Known Drug & Substance Allergies
                </span>
                <p className="mt-0.5 rounded-md bg-rose-50 p-2.5 font-medium text-rose-900 border border-rose-200">
                  {medHistory.allergies || 'None reported / No known drug allergies (NKDA)'}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  Systemic & Chronic Conditions
                </span>
                <p className="mt-0.5 rounded-md bg-amber-50 p-2.5 font-medium text-amber-900 border border-amber-200">
                  {medHistory.chronicConditions || 'None reported'}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
                  Current Regular Medications
                </span>
                <p className="mt-0.5 text-ink-800 bg-ink-50 p-2 rounded border border-ink-100">
                  {medHistory.currentMedications || 'None'}
                </p>
              </div>

              {/* Siddha Specific Profile */}
              {(patient.practiceType === 'ayurveda' || patient.practiceType === 'both') && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-emerald-600" />
                    Siddha Profile & Constitution (Prakriti / Udaliyal)
                  </span>
                  <div className="mt-2 text-xs space-y-1.5 text-emerald-950">
                    <p>
                      <strong className="text-emerald-900">Constitution:</strong>{' '}
                      {medHistory.siddhaProfile || 'Not formally charted'}
                    </p>
                  </div>
                </div>
              )}

              {/* Dental Specific Profile */}
              {(patient.practiceType === 'dental' || patient.practiceType === 'both') && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-3">
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="size-3.5 text-sky-600" />
                    Dental Medical History
                  </span>
                  <div className="mt-2 text-xs text-sky-950">
                    <p>{medHistory.dentalHistory || 'No prior dental complications reported'}</p>
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
                  Habits & Lifestyle
                </span>
                <p className="mt-0.5 text-xs text-ink-700 bg-ink-50 p-2 rounded">
                  {medHistory.habits || 'None noted'}
                </p>
              </div>

              {medHistory.notes && (
                <div>
                  <span className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
                    General Clinical Notes
                  </span>
                  <p className="mt-0.5 text-xs text-ink-700 bg-ink-50 p-2 rounded">
                    {medHistory.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: OP CONSULTATIONS / VISITS TIMELINE */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink-900">
              Outpatient Consultations ({visits.length})
            </h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onNewVisit?.(patient)}
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800"
            >
              <Plus className="size-4" /> Add Today's OP Consultation
            </Button>
          </div>

          {visits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center bg-white">
              <Stethoscope className="mx-auto size-10 text-ink-300" />
              <p className="mt-2 text-sm font-medium text-ink-900">No OP consultations recorded yet</p>
              <p className="text-xs text-ink-500">Record an outpatient consultation with doctor, vitals, diagnosis, and treatment.</p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onNewVisit?.(patient)}
                className="mt-4 gap-1.5 bg-emerald-700"
              >
                <Plus className="size-4" /> Record First Consultation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="rounded-xl border border-ink-200 bg-white p-5 shadow-xs transition hover:border-emerald-300"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm">
                        #{v.tokenNumber || idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink-900">
                            {formatDate(v.visitDate)}
                          </span>
                          <span className="text-xs text-ink-400">· {v.visitTime}</span>
                          <PracticeBadge practice={v.practiceType} />
                        </div>
                        <p className="text-xs text-ink-600 font-medium">
                          Dr. {v.doctorName || 'Attending Physician'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.consultationFee > 0 && (
                        <span className="text-xs font-semibold text-ink-700 bg-ink-100 px-2 py-0.5 rounded">
                          Fee: {formatCurrency(v.consultationFee)} ({v.paymentStatus})
                        </span>
                      )}
                      {v.prescriptionId && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs gap-1 py-1 h-7 border-teal-300 text-teal-800"
                          onClick={() => {
                            const found = prescriptions.find((p) => p.id === v.prescriptionId);
                            if (found) onViewPrescription?.(found);
                          }}
                        >
                          <Pill className="size-3" /> View Prescription
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Vitals Strip */}
                  {v.vitals && (
                    <div className="mt-3 flex flex-wrap gap-3 rounded-lg bg-ink-50/70 p-2.5 text-xs text-ink-700 border border-ink-100">
                      {v.vitals.bp && <span><strong>BP:</strong> {v.vitals.bp} mmHg</span>}
                      {v.vitals.pulse && <span><strong>Pulse:</strong> {v.vitals.pulse} bpm</span>}
                      {v.vitals.temp && <span><strong>Temp:</strong> {v.vitals.temp} °F</span>}
                      {v.vitals.weight && <span><strong>Weight:</strong> {v.vitals.weight} kg</span>}
                      {v.vitals.rbs && <span><strong>RBS:</strong> {v.vitals.rbs} mg/dL</span>}
                      {v.vitals.spo2 && <span><strong>SpO2:</strong> {v.vitals.spo2}%</span>}
                    </div>
                  )}

                  {/* Clinical Details */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-ink-800">Chief Complaints:</p>
                      <p className="mt-0.5 text-ink-700">{v.chiefComplaints || 'Routine checkup'}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-ink-800">Diagnosis:</p>
                      <p className="mt-0.5 text-emerald-900 font-medium">
                        {v.finalDiagnosis || v.provisionalDiagnosis || 'Clinical consultation'}
                      </p>
                    </div>

                    {v.clinicalExamination && (
                      <div className="md:col-span-2">
                        <p className="font-semibold text-ink-800">Examination & Findings:</p>
                        <p className="mt-0.5 text-ink-700 whitespace-pre-line">{v.clinicalExamination}</p>
                      </div>
                    )}

                    {v.treatmentGiven && (
                      <div className="md:col-span-2">
                        <p className="font-semibold text-emerald-800">Treatment Given / Procedure:</p>
                        <p className="mt-0.5 text-ink-800 font-medium">{v.treatmentGiven}</p>
                      </div>
                    )}

                    {v.dietAdvice && (
                      <div className="md:col-span-2 bg-amber-50/60 p-2 rounded border border-amber-100">
                        <p className="font-semibold text-amber-900">Diet & Lifestyle Advice (Pathiyam):</p>
                        <p className="mt-0.5 text-amber-950">{v.dietAdvice}</p>
                      </div>
                    )}

                    {v.nextFollowUp && (
                      <div className="md:col-span-2 text-ink-600 font-medium">
                        📅 Next Follow-Up Review: <strong className="text-ink-900">{formatDate(v.nextFollowUp)}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRESCRIPTIONS & TABLET DETAILS */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink-900">
              Prescriptions & Tablets Given ({prescriptions.length})
            </h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onWritePrescription?.(patient)}
              className="gap-1.5 bg-teal-700 hover:bg-teal-800"
            >
              <Pill className="size-4" /> Write New Prescription
            </Button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center bg-white">
              <Pill className="mx-auto size-10 text-ink-300" />
              <p className="mt-2 text-sm font-medium text-ink-900">No prescriptions written yet</p>
              <p className="text-xs text-ink-500">
                Prescribe Siddha kashayams, choornams, or Dental tablets, antibiotics, and mouthwashes with complete dosage timings.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onWritePrescription?.(patient)}
                className="mt-4 gap-1.5 bg-teal-700"
              >
                <Plus className="size-4" /> Write First Prescription
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-xl border border-ink-200 bg-white p-5 shadow-xs transition hover:border-teal-300"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {rx.prescriptionNumber || 'RX-RECORD'}
                        </span>
                        <PracticeBadge practice={rx.practiceType} />
                        <span className="text-xs text-ink-500">
                          Date: {formatDate(rx.date)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-700 font-medium">
                        Prescribed by: <strong className="text-ink-900">Dr. {rx.doctorName || 'Doctor'}</strong>
                        {rx.doctorQualification ? ` (${rx.doctorQualification})` : ''}
                        {rx.doctorRegNo ? ` · Reg: ${rx.doctorRegNo}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onViewPrescription?.(rx)}
                        className="gap-1.5 text-xs h-8 border-teal-300 text-teal-800 bg-teal-50/50 hover:bg-teal-100"
                      >
                        <Printer className="size-3.5" /> Print Prescription Slip
                      </Button>
                    </div>
                  </div>

                  {rx.diagnosis && (
                    <p className="mt-2 text-xs text-ink-600">
                      <strong>Diagnosis / Condition:</strong> {rx.diagnosis}
                    </p>
                  )}

                  {/* Formatted Tablets / Medications Table */}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[550px] text-left text-xs">
                      <thead className="bg-ink-50 font-semibold text-ink-700 border-y border-ink-200">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Medicine / Tablet Name</th>
                          <th className="py-2 px-3">Dosage & Freq</th>
                          <th className="py-2 px-3">Timing & Vehicle (Anupanam)</th>
                          <th className="py-2 px-3">Duration</th>
                          <th className="py-2 px-3">Qty</th>
                          <th className="py-2 px-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {(rx.items || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-ink-50/60">
                            <td className="py-2.5 px-3 font-mono text-ink-400">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-ink-900">{item.name}</span>
                              <div className="text-[11px] text-ink-500">
                                {titleCase(item.type)} {item.strength ? `· ${item.strength}` : ''}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-teal-800">
                              {item.frequency || '1-0-1'}
                              <div className="text-[11px] font-normal text-ink-500">{item.dosage || '1 dose'}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-ink-800">
                                {item.timing ? titleCase(item.timing) : 'After Food'}
                              </span>
                              {item.anupanam && (
                                <div className="text-[11px] text-emerald-700 font-medium">
                                  With {item.anupanam}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-ink-700">{item.duration || '—'}</td>
                            <td className="py-2.5 px-3 text-ink-700 font-medium">{item.totalQuantity || '—'}</td>
                            <td className="py-2.5 px-3 text-ink-500 italic">{item.instructions || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rx.generalAdvice && (
                    <div className="mt-3 rounded-lg bg-amber-50/70 p-2.5 text-xs text-amber-900 border border-amber-200">
                      <strong>Dietary & Clinical Advice:</strong> {rx.generalAdvice}
                    </div>
                  )}

                  {rx.followUpDate && (
                    <div className="mt-2 text-xs text-ink-600">
                      📅 Review On: <strong>{formatDate(rx.followUpDate)}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ONLINE APPOINTMENT REQUESTS */}
      {activeTab === 'appointments' && (
        <Card title={`Online Appointment Bookings (${appointments.length})`}>
          <ul className="divide-y divide-ink-100 text-sm">
            {appointments.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-ink-900">{a.serviceName || 'Consultation'}</p>
                  <p className="text-xs text-ink-500">
                    Preferred: {formatDate(a.preferredDate)} at {formatTime(a.preferredTime)} · Dr. {a.doctorName || 'Doctor'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PracticeBadge practice={a.practiceType} />
                  <StatusBadge status={a.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
