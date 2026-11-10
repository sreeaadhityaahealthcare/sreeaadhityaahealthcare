import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Heart,
  Plus,
  Sparkles,
  Stethoscope,
  User,
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { SelectField, TextAreaField, TextField, Toggle } from '../ui/FormField';
import { Badge, PracticeBadge } from '../ui/Badges';
import { createOpVisit, getNextTodayToken } from '../../services/opVisitService';
import { doctorService, scopeConstraint } from '../../services/crud';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, todayISO } from '../../utils/format';

const SIDDHA_COMPLAINTS = [
  'Knee joint pain & stiffness',
  'Lower backache (Lumbar spondylosis)',
  'Gas trouble & Indigestion',
  'Skin itching / Dry eczema',
  'Sinusitis & Chronic headache',
  'Cough, phlegm & breathlessness',
  'General fatigue & Body heat',
  'Insomnia & Nervous stress',
];

const DENTAL_COMPLAINTS = [
  'Severe throbbing toothache',
  'Cavity / Food lodgement',
  'Bleeding gums & Bad breath',
  'Hot / Cold sensitivity',
  'Wisdom tooth pain & swelling',
  'Broken tooth / Crown replacement',
  'Loose tooth / Periodontal mobility',
  'Jaw pain / Clicking during chewing',
];

const SIDDHA_PROCEDURES = [
  'Varmam manipulation therapy',
  'Thokkanam (Medical massage)',
  'Kizhi (Herbal pouch fomentation)',
  'Pinda Thailam local application',
  'Murivenna herbal wound dressing',
  'Steam inhalation / Vedhu',
];

const DENTAL_PROCEDURES = [
  'Ultrasonic scaling & Polishing',
  'Composite / GIC tooth restoration',
  'Tooth extraction under LA',
  'Root canal biomechanical preparation',
  'Subgingival curettage & irrigation',
  'Abscess drainage & medication',
];

export default function OpVisitModal({
  open,
  onClose,
  patient,
  onSaved,
}) {
  const { user, practiceScope } = useAuth();
  const toast = useToast();

  const defaultPractice =
    patient?.practiceType === 'dental'
      ? 'dental'
      : practiceScope || 'ayurveda';

  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    practiceType: defaultPractice,
    doctorId: '',
    doctorName: '',
    visitDate: todayISO(),
    visitTime: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }),
    tokenNumber: 1,
    chiefComplaints: '',
    duration: '',
    vitals: {
      bp: '120/80',
      pulse: '76',
      temp: '98.4',
      weight: '',
      height: '',
      bmi: '',
      rbs: '',
      spo2: '99',
    },
    clinicalExamination: '',
    provisionalDiagnosis: '',
    finalDiagnosis: '',
    treatmentGiven: '',
    investigationsOrdered: '',
    dietAdvice: '',
    nextFollowUp: '',
    consultationFee: 200,
    paymentStatus: 'paid',
  });

  const [writeRxNow, setWriteRxNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);

  // Load doctors from Firestore
  useEffect(() => {
    if (!open) return;
    doctorService
      .list(scopeConstraint(formData.practiceType))
      .then((docs) => {
        setDoctors(docs);
        if (docs.length > 0 && !formData.doctorId) {
          setFormData((prev) => ({
            ...prev,
            doctorId: docs[0].id,
            doctorName: docs[0].name,
          }));
        }
      })
      .catch((err) => console.warn('Could not load doctors:', err));
  }, [open, formData.practiceType]);

  // Load next token for selected practice
  useEffect(() => {
    if (!open) return;
    setLoadingToken(true);
    getNextTodayToken(formData.practiceType, formData.visitDate)
      .then((t) => setFormData((prev) => ({ ...prev, tokenNumber: t })))
      .finally(() => setLoadingToken(false));
  }, [open, formData.practiceType, formData.visitDate]);

  if (!patient) return null;

  // Auto calculate BMI when weight & height change
  const handleVitalChange = (key, val) => {
    const updated = { ...formData.vitals, [key]: val };
    const w = parseFloat(key === 'weight' ? val : updated.weight);
    const h = parseFloat(key === 'height' ? val : updated.height) / 100; // in meters
    if (w > 0 && h > 0) {
      updated.bmi = (w / (h * h)).toFixed(1);
    }
    setFormData((prev) => ({ ...prev, vitals: updated }));
  };

  const addQuickComplaint = (tag) => {
    setFormData((prev) => {
      const current = prev.chiefComplaints ? `${prev.chiefComplaints}, ` : '';
      return { ...prev, chiefComplaints: `${current}${tag}` };
    });
  };

  const addQuickProcedure = (tag) => {
    setFormData((prev) => {
      const current = prev.treatmentGiven ? `${prev.treatmentGiven}, ` : '';
      return { ...prev, treatmentGiven: `${current}${tag}` };
    });
  };

  const setFollowUpDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormData((prev) => ({ ...prev, nextFollowUp: d.toISOString().slice(0, 10) }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        patientId: patient.id,
        opNumber: patient.opNumber,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientAge: patient.age,
        patientGender: patient.gender,
      };

      const res = await createOpVisit(payload, user);
      toast.success(
        `OP Consultation saved! Token #${res.tokenNumber} for ${patient.name}`
      );
      onSaved?.({ id: res.id, ...payload }, writeRxNow);
      onClose();
    } catch (err) {
      console.error('Error saving OP visit:', err);
      toast.error(err.message || 'Could not save OP consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDental = formData.practiceType === 'dental';
  const allergies = patient.medicalHistory?.allergies;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={`Outpatient (OP) Consultation: ${patient.name}`}
      description={`OP Number: ${patient.opNumber || '—'} · ${patient.age || '—'} yrs · ${patient.phone}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <label className="flex items-center gap-2 text-xs font-semibold text-teal-800 cursor-pointer">
            <input
              type="checkbox"
              checked={writeRxNow}
              onChange={(e) => setWriteRxNow(e.target.checked)}
              className="rounded border-teal-400 text-teal-600 focus:ring-teal-500"
            />
            Write Prescription immediately after saving
          </label>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              Save OP Consultation
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient Warning Strip if allergies exist */}
        {allergies && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900 font-medium">
            <AlertTriangle className="size-4 text-rose-600 shrink-0" />
            <span>
              <strong>PATIENT ALLERGIES WARNING:</strong> {allergies}
            </span>
          </div>
        )}

        {/* Section 1: Department, Doctor & Token */}
        <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <SelectField
              label="Department"
              value={formData.practiceType}
              onChange={(e) =>
                setFormData({ ...formData, practiceType: e.target.value })
              }
              disabled={Boolean(practiceScope)}
            >
              <option value="ayurveda">Siddha Clinic</option>
              <option value="dental">Dental Clinic</option>
            </SelectField>

            <SelectField
              label="Consulting Doctor"
              value={formData.doctorId}
              onChange={(e) => {
                const docId = e.target.value;
                const found = doctors.find((d) => d.id === docId);
                setFormData({
                  ...formData,
                  doctorId: docId,
                  doctorName: found ? found.name : '',
                });
              }}
            >
              {doctors.length > 0 ? (
                doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.name} ({d.qualifications || d.practiceType})
                  </option>
                ))
              ) : (
                <option value="default">
                  {isDental ? 'Dr. Sree (Dental Surgeon)' : 'Dr. Aadhityaa (Siddha Physician)'}
                </option>
              )}
            </SelectField>

            <TextField
              label="Visit Date"
              type="date"
              value={formData.visitDate}
              onChange={(e) =>
                setFormData({ ...formData, visitDate: e.target.value })
              }
            />

            <div className="flex items-center gap-2">
              <div className="w-full">
                <TextField
                  label="Token / OPD #"
                  type="number"
                  value={formData.tokenNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenNumber: Number(e.target.value) })
                  }
                  hint={loadingToken ? 'Refreshing token...' : 'Today queue #'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Vitals Examination Grid */}
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="size-4 text-emerald-600" /> Patient Vitals & Clinical Measurements
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            <TextField
              label="BP (mmHg)"
              placeholder="120/80"
              value={formData.vitals.bp}
              onChange={(e) => handleVitalChange('bp', e.target.value)}
            />
            <TextField
              label="Pulse (bpm)"
              placeholder="76"
              value={formData.vitals.pulse}
              onChange={(e) => handleVitalChange('pulse', e.target.value)}
            />
            <TextField
              label="Temp (°F)"
              placeholder="98.4"
              value={formData.vitals.temp}
              onChange={(e) => handleVitalChange('temp', e.target.value)}
            />
            <TextField
              label="Weight (kg)"
              placeholder="65"
              value={formData.vitals.weight}
              onChange={(e) => handleVitalChange('weight', e.target.value)}
            />
            <TextField
              label="Height (cm)"
              placeholder="165"
              value={formData.vitals.height}
              onChange={(e) => handleVitalChange('height', e.target.value)}
            />
            <TextField
              label="BMI"
              placeholder="Auto"
              value={formData.vitals.bmi}
              disabled
            />
            <TextField
              label="Blood Sugar (mg/dL)"
              placeholder="110 (RBS)"
              value={formData.vitals.rbs}
              onChange={(e) => handleVitalChange('rbs', e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Chief Complaints & Clinical Findings */}
        <div className="space-y-4">
          <div>
            <TextAreaField
              label="Chief Complaints & History of Presenting Illness"
              rows={2}
              required
              placeholder="e.g. Pain in lower right jaw since 3 days, worsens with cold water..."
              value={formData.chiefComplaints}
              onChange={(e) =>
                setFormData({ ...formData, chiefComplaints: e.target.value })
              }
            />
            <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
              <span className="text-ink-400 self-center mr-1">Quick click:</span>
              {(isDental ? DENTAL_COMPLAINTS : SIDDHA_COMPLAINTS).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => addQuickComplaint(c)}
                  className="rounded bg-ink-100 px-2 py-0.5 text-ink-800 hover:bg-emerald-100"
                >
                  + {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextAreaField
              label={
                isDental
                  ? 'Dental Examination (Tooth Notation & Gum Findings)'
                  : 'Siddha Naadi & Clinical Examination (En-vagai Thervu)'
              }
              rows={3}
              placeholder={
                isDental
                  ? 'Tooth #16 deep occlusal caries, tender to percussion. Gums: Marginal gingivitis...'
                  : 'Naadi: Vatha-Pitha naadi dominant. Sparsam: Ushnam. Tongue: Coated white...'
              }
              value={formData.clinicalExamination}
              onChange={(e) =>
                setFormData({ ...formData, clinicalExamination: e.target.value })
              }
            />

            <div className="space-y-3">
              <TextField
                label="Provisional Diagnosis"
                placeholder="e.g. Acute Irreversible Pulpitis / Vatha Soolai"
                value={formData.provisionalDiagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, provisionalDiagnosis: e.target.value })
                }
              />

              <TextField
                label="Final Confirmed Diagnosis"
                placeholder="e.g. Chronic Generalized Periodontitis / Keel Vatham (Osteoarthritis)"
                value={formData.finalDiagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, finalDiagnosis: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <TextAreaField
              label="Treatment / Clinical Procedure Performed Today"
              rows={2}
              placeholder="e.g. Local anesthesia given, cavity prepared, GIC restoration placed, occlusion checked..."
              value={formData.treatmentGiven}
              onChange={(e) =>
                setFormData({ ...formData, treatmentGiven: e.target.value })
              }
            />
            <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
              <span className="text-ink-400 self-center mr-1">Common procedures:</span>
              {(isDental ? DENTAL_PROCEDURES : SIDDHA_PROCEDURES).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => addQuickProcedure(p)}
                  className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Dietary Advice, Review & Billing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-ink-200 bg-white p-4">
          <div className="sm:col-span-2">
            <TextField
              label="Dietary & Lifestyle Advice (Pathiyam / Post-op Care)"
              placeholder={
                isDental
                  ? 'Soft diet for 24h, avoid hot beverages, warm salt water rinse from tomorrow...'
                  : 'Avoid sour and fermented food, drink warm water, avoid cold exposure...'
              }
              value={formData.dietAdvice}
              onChange={(e) =>
                setFormData({ ...formData, dietAdvice: e.target.value })
              }
            />
          </div>

          <div>
            <TextField
              label="Next Review / Follow-up Date"
              type="date"
              value={formData.nextFollowUp}
              onChange={(e) =>
                setFormData({ ...formData, nextFollowUp: e.target.value })
              }
            />
            <div className="mt-1 flex gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => setFollowUpDays(3)}
                className="rounded bg-ink-100 px-1.5 py-0.5 text-ink-700 hover:bg-ink-200"
              >
                +3d
              </button>
              <button
                type="button"
                onClick={() => setFollowUpDays(7)}
                className="rounded bg-ink-100 px-1.5 py-0.5 text-ink-700 hover:bg-ink-200"
              >
                +1w
              </button>
              <button
                type="button"
                onClick={() => setFollowUpDays(15)}
                className="rounded bg-ink-100 px-1.5 py-0.5 text-ink-700 hover:bg-ink-200"
              >
                +15d
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:col-span-3 pt-2 border-t border-ink-100">
            <TextField
              label="Consultation / OPD Fee (₹)"
              type="number"
              value={formData.consultationFee}
              onChange={(e) =>
                setFormData({ ...formData, consultationFee: e.target.value })
              }
            />

            <SelectField
              label="Payment Status"
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData({ ...formData, paymentStatus: e.target.value })
              }
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="waived">Waived / Free</option>
            </SelectField>
          </div>
        </div>
      </form>
    </Modal>
  );
}
