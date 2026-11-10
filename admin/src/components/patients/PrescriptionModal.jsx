import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  FileText,
  Pill,
  Plus,
  Printer,
  Sparkles,
  Stethoscope,
  Trash2,
  Zap,
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { SelectField, TextAreaField, TextField } from '../ui/FormField';
import { PracticeBadge } from '../ui/Badges';
import { createPrescription, generatePrescriptionNumber } from '../../services/prescriptionService';
import { listMedications } from '../../services/medicationService';
import { doctorService, scopeConstraint } from '../../services/crud';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, todayISO } from '../../utils/format';

const EMPTY_ITEM = {
  name: '',
  type: 'tablet',
  strength: '',
  dosage: '1 tablet',
  frequency: '1-0-1',
  timing: 'after_food',
  anupanam: 'With warm water',
  duration: '5 days',
  totalQuantity: '10 tablets',
  instructions: 'Take after meals with water',
};

// Preset treatment protocols for fast 1-click prescribing
const PRESETS = {
  dental_extraction: {
    label: 'Dental Post-Extraction / Surgery',
    items: [
      {
        name: 'Amoxicillin 500mg',
        type: 'capsule',
        strength: '500mg',
        dosage: '1 capsule',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'With water',
        duration: '5 days',
        totalQuantity: '10 capsules',
        instructions: 'Complete full course.',
      },
      {
        name: 'Aceclofenac + Paracetamol',
        type: 'tablet',
        strength: '100mg + 325mg',
        dosage: '1 tablet',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'With water',
        duration: '3 days',
        totalQuantity: '6 tablets',
        instructions: 'Take strictly after meals for pain.',
      },
      {
        name: 'Pantoprazole 40mg (Pan-40)',
        type: 'tablet',
        strength: '40mg',
        dosage: '1 tablet',
        frequency: '1-0-0',
        timing: 'empty_stomach',
        anupanam: '30 mins before breakfast',
        duration: '5 days',
        totalQuantity: '5 tablets',
        instructions: 'Take on empty stomach for acidity protection.',
      },
      {
        name: 'Chlorhexidine 0.2% Mouthwash',
        type: 'mouthwash',
        strength: '0.2% w/v',
        dosage: '10 ml',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'Swish for 1 min then spit',
        duration: '7 days',
        totalQuantity: '1 bottle',
        instructions: 'Start from tomorrow. Do not swallow or eat for 30 mins.',
      },
    ],
    advice: 'Bite on cotton pack for 45 mins. Soft, cold diet for 24h. No spitting, hot drinks or straw. Warm salt water rinse starting next day.',
  },
  dental_pain: {
    label: 'Dental Acute Pain & Swelling',
    items: [
      {
        name: 'Augmentin 625mg',
        type: 'tablet',
        strength: '625mg',
        dosage: '1 tablet',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'With water',
        duration: '5 days',
        totalQuantity: '10 tablets',
        instructions: 'Complete antibiotic course.',
      },
      {
        name: 'Metronidazole 400mg',
        type: 'tablet',
        strength: '400mg',
        dosage: '1 tablet',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'With water',
        duration: '5 days',
        totalQuantity: '10 tablets',
        instructions: 'Strictly avoid alcohol.',
      },
      {
        name: 'Ketorolac Tromethamine 10mg DT',
        type: 'tablet',
        strength: '10mg',
        dosage: '1 tablet',
        frequency: 'SOS',
        timing: 'after_food',
        anupanam: 'Disperse in water',
        duration: '2 days',
        totalQuantity: '4 tablets',
        instructions: 'Take only when pain is severe.',
      },
    ],
    advice: 'Avoid chewing on the affected side. Cold compress on outer jaw if swelling persists. Immediate dental review scheduled.',
  },
  siddha_joints: {
    label: 'Siddha Arthritis & Joint Pain (Vatha Soolai)',
    items: [
      {
        name: 'Amukkara Choornam Mathirai',
        type: 'tablet',
        strength: '500mg',
        dosage: '2 tablets',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'With warm milk or honey',
        duration: '15 days',
        totalQuantity: '60 tablets',
        instructions: 'Take with warm milk for joint stiffness and strength.',
      },
      {
        name: 'Thirikadugu Choornam',
        type: 'choornam',
        strength: 'Herbal powder',
        dosage: '2 grams',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'With pure honey',
        duration: '15 days',
        totalQuantity: '1 bottle (50g)',
        instructions: 'Mix with half teaspoon honey after food.',
      },
      {
        name: 'Pinda Thailam (External Application)',
        type: 'thailam',
        strength: 'Medicated oil',
        dosage: '10-15 ml',
        frequency: '1-0-1',
        timing: 'anytime',
        anupanam: 'Gentle warm massage',
        duration: '15 days',
        totalQuantity: '1 bottle (100ml)',
        instructions: 'Warm slightly, massage gently on joints, hot fomentation after 30 mins.',
      },
    ],
    advice: 'Pathiyam: Strictly avoid cold drinks, ice, potato, brinjal, curd, dry fish. Drink warm ginger water throughout the day.',
  },
  siddha_fever: {
    label: 'Siddha Viral Fevers & Respiratory Care',
    items: [
      {
        name: 'Nilavembu Kudineer Choornam',
        type: 'kashayam',
        strength: 'Coarse powder',
        dosage: '5-10 grams',
        frequency: '1-0-1',
        timing: 'before_food',
        anupanam: 'Boil in 240ml water, reduce to 60ml, filter and drink warm',
        duration: '5 days',
        totalQuantity: '1 packet (50g)',
        instructions: 'Take warm decoction on empty stomach twice daily.',
      },
      {
        name: 'Kabasura Kudineer Choornam',
        type: 'kashayam',
        strength: 'Herbal powder',
        dosage: '5 grams',
        frequency: '1-0-1',
        timing: 'before_food',
        anupanam: 'Boiled decoction',
        duration: '5 days',
        totalQuantity: '1 packet (50g)',
        instructions: 'Boil and drink fresh warm decoction.',
      },
      {
        name: 'Bramanandha Bairavam Mathirai',
        type: 'tablet',
        strength: '100mg',
        dosage: '1 tablet',
        frequency: '1-0-1',
        timing: 'after_food',
        anupanam: 'With ginger juice and honey',
        duration: '3 days',
        totalQuantity: '6 tablets',
        instructions: 'Take after food with ginger juice and honey.',
      },
    ],
    advice: 'Complete bed rest. Hot pepper rasam diet. Drink warm boiled water only. Avoid AC and head bath.',
  },
};

export default function PrescriptionModal({
  open,
  onClose,
  patient,
  visitId = null,
  prefillPractice = 'ayurveda',
  onSaved,
}) {
  const { user, practiceScope } = useAuth();
  const toast = useToast();

  const defaultPractice =
    patient?.practiceType === 'dental'
      ? 'dental'
      : practiceScope || prefillPractice || 'ayurveda';

  const [doctors, setDoctors] = useState([]);
  const [formulary, setFormulary] = useState([]);
  const [rxNumber, setRxNumber] = useState('');
  const [loadingNumber, setLoadingNumber] = useState(false);

  const [formData, setFormData] = useState({
    practiceType: defaultPractice,
    doctorId: '',
    doctorName: '',
    doctorQualification: '',
    doctorRegNo: '',
    date: todayISO(),
    diagnosis: '',
    items: [{ ...EMPTY_ITEM }],
    generalAdvice: '',
    followUpDate: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Load formulary & doctors
  useEffect(() => {
    if (!open) return;

    // Load master medications for autocomplete
    listMedications(formData.practiceType)
      .then((meds) => setFormulary(meds))
      .catch((err) => console.warn('Formulary load err:', err));

    // Load doctors
    doctorService
      .list(scopeConstraint(formData.practiceType))
      .then((docs) => {
        setDoctors(docs);
        if (docs.length > 0 && !formData.doctorId) {
          const first = docs[0];
          setFormData((prev) => ({
            ...prev,
            doctorId: first.id,
            doctorName: first.name,
            doctorQualification: first.qualifications || '',
            doctorRegNo: first.registrationNumber || '',
          }));
        }
      })
      .catch((err) => console.warn('Doctor load err:', err));

    // Generate next RX Number
    setLoadingNumber(true);
    generatePrescriptionNumber(formData.practiceType)
      .then((num) => setRxNumber(num))
      .finally(() => setLoadingNumber(false));
  }, [open, formData.practiceType]);

  if (!patient) return null;

  // Handle medication select from formulary
  const handleMedicationSelect = (index, selectedName) => {
    const found = formulary.find(
      (m) => m.name.toLowerCase() === selectedName.toLowerCase()
    );

    setFormData((prev) => {
      const items = [...prev.items];
      if (found) {
        items[index] = {
          name: found.name,
          type: found.type || 'tablet',
          strength: found.strength || '',
          dosage: found.defaultDosage || '1 tablet',
          frequency: found.defaultFrequency || '1-0-1',
          timing: found.defaultTiming || 'after_food',
          anupanam: found.defaultAnupanam || 'With warm water',
          duration: found.duration || '5 days',
          totalQuantity: found.duration?.includes('5')
            ? '10 tablets'
            : '15 tablets',
          instructions: found.instructions || '',
        };
      } else {
        items[index] = { ...items[index], name: selectedName };
      }
      return { ...prev, items };
    });
  };

  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      toast.error('Prescription must have at least one medication.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      items: preset.items.map((i) => ({ ...i })),
      generalAdvice: preset.advice,
    }));
    toast.success(`Applied protocol: ${preset.label}`);
  };

  const handleSubmit = async (andPrint = false) => {
    if (submitting) return;

    // Validate that medicines have names
    const validItems = formData.items.filter((i) => i.name?.trim());
    if (validItems.length === 0) {
      toast.error('Please enter at least one medicine or tablet name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        prescriptionNumber: rxNumber,
        patientId: patient.id,
        opNumber: patient.opNumber,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientAge: patient.age,
        patientGender: patient.gender,
        visitId: visitId || null,
        items: validItems,
      };

      const res = await createPrescription(payload, user);
      toast.success(
        `Prescription ${res.prescriptionNumber} saved for ${patient.name}!`
      );
      onSaved?.({ id: res.id, ...payload }, andPrint);
      onClose();
    } catch (err) {
      console.error('Failed to save prescription:', err);
      toast.error(err.message || 'Could not save prescription.');
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
      title={`Medical Prescription Builder · ${patient.name}`}
      description={`OP Number: ${patient.opNumber || '—'} · Phone: ${patient.phone} · Rx No: ${rxNumber || 'Generating...'}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-ink-500">
            Total medicines: <strong>{formData.items.length}</strong>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSubmit(false)}
              loading={submitting}
            >
              Save Only
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(true)}
              loading={submitting}
              className="gap-1.5 bg-teal-700 hover:bg-teal-800"
            >
              <Printer className="size-4" /> Save & Print Prescription
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Patient Warning Strip */}
        {allergies && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900 font-semibold">
            <AlertTriangle className="size-4 text-rose-600 shrink-0" />
            <span>
              ALERT: Patient has reported allergies: <span className="underline">{allergies}</span>
            </span>
          </div>
        )}

        {/* Prescription Metadata: Doctor, Date, Diagnosis */}
        <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-4">
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
              label="Prescribing Doctor"
              value={formData.doctorId}
              onChange={(e) => {
                const docId = e.target.value;
                const found = doctors.find((d) => d.id === docId);
                setFormData({
                  ...formData,
                  doctorId: docId,
                  doctorName: found ? found.name : '',
                  doctorQualification: found?.qualifications || '',
                  doctorRegNo: found?.registrationNumber || '',
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
              label="Prescription Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <TextField
              label="Diagnosis / Clinical Impression"
              placeholder="e.g. Tooth pulpitis / Keel Vatham"
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
            />
          </div>
        </div>

        {/* 1-Click Clinical Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-teal-50/80 p-2.5 text-xs border border-teal-200">
          <span className="font-bold text-teal-900 flex items-center gap-1">
            <Zap className="size-3.5 text-teal-600" /> Fast Treatment Protocols:
          </span>
          {isDental ? (
            <>
              <button
                type="button"
                onClick={() => applyPreset('dental_extraction')}
                className="rounded-full bg-white px-2.5 py-1 font-medium text-teal-900 border border-teal-300 hover:bg-teal-100 shadow-2xs"
              >
                + Post-Extraction Protocol
              </button>
              <button
                type="button"
                onClick={() => applyPreset('dental_pain')}
                className="rounded-full bg-white px-2.5 py-1 font-medium text-teal-900 border border-teal-300 hover:bg-teal-100 shadow-2xs"
              >
                + Acute Pain & Infection Protocol
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => applyPreset('siddha_joints')}
                className="rounded-full bg-white px-2.5 py-1 font-medium text-teal-900 border border-teal-300 hover:bg-teal-100 shadow-2xs"
              >
                + Arthritis & Joint Pain Protocol
              </button>
              <button
                type="button"
                onClick={() => applyPreset('siddha_fever')}
                className="rounded-full bg-white px-2.5 py-1 font-medium text-teal-900 border border-teal-300 hover:bg-teal-100 shadow-2xs"
              >
                + Viral Fever & Respiratory Protocol
              </button>
            </>
          )}
        </div>

        {/* Medications / Tablets Dynamic Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="size-4 text-teal-600" /> Prescribed Medications, Tablets & Formulations
            </h4>
            <Button
              size="sm"
              variant="secondary"
              onClick={addItem}
              className="gap-1 text-xs border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100"
            >
              <Plus className="size-3.5" /> Add Medicine / Tablet
            </Button>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-ink-200 bg-white p-3.5 shadow-2xs transition hover:border-teal-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-ink-800">
                      Medicine / Tablet #{idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    title="Remove item"
                    className="text-ink-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                  {/* Medicine Name with list dropdown */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                      Medicine Name / Tablet *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        list={`med-list-${idx}`}
                        value={item.name}
                        onChange={(e) => handleMedicationSelect(idx, e.target.value)}
                        placeholder="Type or select from formulary..."
                        className="block w-full rounded-md border border-ink-300 bg-white px-2.5 py-1.5 text-xs text-ink-900 placeholder:text-ink-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-200"
                      />
                      <datalist id={`med-list-${idx}`}>
                        {formulary.map((m) => (
                          <option key={m.id || m.name} value={m.name}>
                            {m.type} · {m.strength || ''} ({m.defaultFrequency || ''})
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Dosage Form / Type */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                      Formulation Type
                    </label>
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(idx, 'type', e.target.value)}
                      className="block w-full rounded-md border border-ink-300 bg-white px-2 py-1.5 text-xs text-ink-900"
                    >
                      <option value="tablet">Tablet (Tab)</option>
                      <option value="capsule">Capsule (Cap)</option>
                      <option value="syrup">Syrup (Syr)</option>
                      <option value="kashayam">Kashayam / Kudineer</option>
                      <option value="choornam">Choornam (Powder)</option>
                      <option value="lehyam">Lehyam (Jam)</option>
                      <option value="thailam">Thailam (Oil)</option>
                      <option value="ointment_gel">Ointment / Dental Gel</option>
                      <option value="mouthwash">Mouthwash / Gargle</option>
                      <option value="drops">Drops</option>
                      <option value="powder">Powder</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Strength */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                      Strength
                    </label>
                    <input
                      type="text"
                      value={item.strength}
                      onChange={(e) => updateItem(idx, 'strength', e.target.value)}
                      placeholder="e.g. 500mg / 10ml"
                      className="block w-full rounded-md border border-ink-300 bg-white px-2 py-1.5 text-xs text-ink-900"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={item.frequency}
                      onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                      className="block w-full rounded-md border border-ink-300 bg-white px-2 py-1.5 text-xs font-semibold text-teal-800"
                    >
                      <option value="1-0-1">1-0-1 (Morning & Night)</option>
                      <option value="1-1-1">1-1-1 (Morning, Noon & Night)</option>
                      <option value="1-0-0">1-0-0 (Morning only)</option>
                      <option value="0-0-1">0-0-1 (Night only)</option>
                      <option value="0-1-0">0-1-0 (Afternoon only)</option>
                      <option value="SOS">SOS (As Needed for Pain)</option>
                      <option value="Once Daily">Once Daily</option>
                      <option value="Stat">Stat (Single Immediate Dose)</option>
                    </select>
                  </div>

                  {/* Timing & Food Relation */}
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                      Relation to Food
                    </label>
                    <select
                      value={item.timing}
                      onChange={(e) => updateItem(idx, 'timing', e.target.value)}
                      className="block w-full rounded-md border border-ink-300 bg-white px-2 py-1.5 text-xs text-ink-900"
                    >
                      <option value="after_food">After Food (Post-meal)</option>
                      <option value="before_food">Before Food (Pre-meal)</option>
                      <option value="empty_stomach">Empty Stomach (Morning)</option>
                      <option value="with_food">With Food</option>
                      <option value="at_bedtime">At Bedtime</option>
                    </select>
                  </div>
                </div>

                {/* Second row of medication details */}
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs pt-2 border-t border-ink-100">
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-600 mb-0.5">
                      Vehicle / Anupanam (With...)
                    </label>
                    <input
                      type="text"
                      value={item.anupanam}
                      onChange={(e) => updateItem(idx, 'anupanam', e.target.value)}
                      placeholder="e.g. Warm water / Honey / Warm milk"
                      className="block w-full rounded border border-ink-200 px-2 py-1 text-xs text-ink-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-ink-600 mb-0.5">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => updateItem(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 days / 15 days"
                      className="block w-full rounded border border-ink-200 px-2 py-1 text-xs text-ink-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-ink-600 mb-0.5">
                      Total Qty / Tablets
                    </label>
                    <input
                      type="text"
                      value={item.totalQuantity}
                      onChange={(e) => updateItem(idx, 'totalQuantity', e.target.value)}
                      placeholder="e.g. 10 tablets / 1 bottle"
                      className="block w-full rounded border border-ink-200 px-2 py-1 text-xs text-ink-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-ink-600 mb-0.5">
                      Special Usage Note
                    </label>
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => updateItem(idx, 'instructions', e.target.value)}
                      placeholder="e.g. Do not swallow / Rinse and spit"
                      className="block w-full rounded border border-ink-200 px-2 py-1 text-xs text-ink-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Clinical & Dietary Advice / Pathiyam */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <TextAreaField
              label="Dietary Advice, Restrictions & Pathiyam"
              rows={2}
              placeholder={
                isDental
                  ? 'e.g. Soft diet for 2 days, avoid hot food/beverages, warm salt water rinse from tomorrow...'
                  : 'e.g. Avoid tamarind, brinjal, dry fish, alcohol and cold items. Drink warm water...'
              }
              value={formData.generalAdvice}
              onChange={(e) =>
                setFormData({ ...formData, generalAdvice: e.target.value })
              }
            />
          </div>

          <div>
            <TextField
              label="Review / Follow-Up Date"
              type="date"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData({ ...formData, followUpDate: e.target.value })
              }
            />
            <p className="mt-1 text-[11px] text-ink-500">
              Printed on the prescription slip for the patient.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
