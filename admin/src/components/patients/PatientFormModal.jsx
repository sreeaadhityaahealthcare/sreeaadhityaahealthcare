import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Check, Loader2, Sparkles, Stethoscope, User, X } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { SelectField, TextAreaField, TextField } from '../ui/FormField';
import { createPatient, generateNextOpNumber, updatePatient } from '../../services/patientService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { normalizePhone, v } from '../../utils/validators';

const COMMON_ALLERGIES = [
  'Penicillin',
  'NSAIDs (Ibuprofen/Aspirin)',
  'Sulfa Drugs',
  'Local Anesthesia (Lignocaine)',
  'Latex',
  'Dust / Pollen',
  'Egg / Food Allergy',
];

const CHRONIC_CONDITIONS = [
  'Diabetes Mellitus',
  'Hypertension (High BP)',
  'Cardiac Condition / Pacemaker',
  'Asthma / Bronchitis',
  'Thyroid Disorder',
  'Bleeding / Clotting Tendency',
  'Kidney Disease',
  'Epilepsy / Fits',
];

const SIDDHA_CONSTITUTIONS = [
  'Vatha Udaliyal (Wind dominant)',
  'Pitha Udaliyal (Fire dominant)',
  'Kapha Udaliyal (Water/Earth dominant)',
  'Vatha-Pitha Udaliyal',
  'Pitha-Kapha Udaliyal',
  'Thontham / Balanced',
];

const DENTAL_CONDITIONS = [
  'Severe Toothache',
  'Bleeding Gums / Gingivitis',
  'Tooth Sensitivity (Hot/Cold)',
  'Food Impaction / Cavities',
  'Undergoing Orthodontic Treatment',
  'Previous Dental Extractions',
  'Root Canal Treated Teeth',
];

export default function PatientFormModal({
  open,
  onClose,
  initialData = null,
  prefillPhone = '',
  prefillPractice = 'ayurveda',
  onSaved,
}) {
  const { user, practiceScope, isSuper } = useAuth();
  const toast = useToast();

  const isEdit = Boolean(initialData?.id);
  const effectivePractice = practiceScope || prefillPractice || 'ayurveda';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    age: '',
    gender: 'female',
    dob: '',
    bloodGroup: '',
    practiceType: effectivePractice,
    opNumber: '',
    address: {
      street: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
    },
    medicalHistory: {
      allergies: '',
      chronicConditions: '',
      currentMedications: '',
      pastSurgeries: '',
      habits: '',
      dentalHistory: '',
      siddhaProfile: '',
      notes: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generatingOp, setGeneratingOp] = useState(false);

  // Initialize form state
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        alternatePhone: initialData.alternatePhone || '',
        email: initialData.email || '',
        age: initialData.age || '',
        gender: initialData.gender || 'female',
        dob: initialData.dob || '',
        bloodGroup: initialData.bloodGroup || '',
        practiceType: initialData.practiceType || effectivePractice,
        opNumber: initialData.opNumber || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          district: initialData.address?.district || '',
          state: initialData.address?.state || 'Tamil Nadu',
          pincode: initialData.address?.pincode || '',
        },
        emergencyContact: {
          name: initialData.emergencyContact?.name || '',
          relation: initialData.emergencyContact?.relation || '',
          phone: initialData.emergencyContact?.phone || '',
        },
        medicalHistory: {
          allergies: initialData.medicalHistory?.allergies || '',
          chronicConditions: initialData.medicalHistory?.chronicConditions || '',
          currentMedications: initialData.medicalHistory?.currentMedications || '',
          pastSurgeries: initialData.medicalHistory?.pastSurgeries || '',
          habits: initialData.medicalHistory?.habits || '',
          dentalHistory: initialData.medicalHistory?.dentalHistory || '',
          siddhaProfile: initialData.medicalHistory?.siddhaProfile || '',
          notes: initialData.medicalHistory?.notes || '',
        },
      });
    } else {
      // New patient
      const defaultData = {
        name: '',
        phone: prefillPhone || '',
        alternatePhone: '',
        email: '',
        age: '',
        gender: 'female',
        dob: '',
        bloodGroup: '',
        practiceType: effectivePractice,
        opNumber: '',
        address: {
          street: '',
          city: '',
          district: '',
          state: 'Tamil Nadu',
          pincode: '',
        },
        emergencyContact: {
          name: '',
          relation: '',
          phone: '',
        },
        medicalHistory: {
          allergies: '',
          chronicConditions: '',
          currentMedications: '',
          pastSurgeries: '',
          habits: '',
          dentalHistory: '',
          siddhaProfile: '',
          notes: '',
        },
      };
      setFormData(defaultData);

      // Auto generate next OP number
      setGeneratingOp(true);
      generateNextOpNumber(effectivePractice)
        .then((op) => setFormData((prev) => ({ ...prev, opNumber: op })))
        .finally(() => setGeneratingOp(false));
    }
    setErrors({});
  }, [open, initialData, prefillPhone, effectivePractice]);

  // Handle practice change and update suggested OP number if not editing
  const handlePracticeChange = async (newPractice) => {
    setFormData((prev) => ({ ...prev, practiceType: newPractice }));
    if (!isEdit) {
      setGeneratingOp(true);
      try {
        const nextOp = await generateNextOpNumber(newPractice);
        setFormData((prev) => ({ ...prev, opNumber: nextOp }));
      } finally {
        setGeneratingOp(false);
      }
    }
  };

  const toggleTag = (field, tag) => {
    setFormData((prev) => {
      const current = prev.medicalHistory[field] || '';
      const items = current
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const exists = items.includes(tag);
      const updated = exists ? items.filter((i) => i !== tag) : [...items, tag];
      return {
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          [field]: updated.join(', '),
        },
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Patient name is required.';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';

    const phoneErr = v.phone(formData.phone, { required: true });
    if (phoneErr) errs.phone = phoneErr;

    if (formData.alternatePhone) {
      const altErr = v.phone(formData.alternatePhone);
      if (altErr) errs.alternatePhone = altErr;
    }

    if (!formData.age || Number(formData.age) <= 0 || Number(formData.age) > 130) {
      errs.age = 'Please enter a valid age (1-130).';
    }

    if (!formData.gender) errs.gender = 'Gender is required.';
    if (!formData.practiceType) errs.practiceType = 'Department is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await updatePatient(initialData.id, formData, user);
        toast.success(`Patient record updated for ${formData.name}`);
        onSaved?.({ id: initialData.id, ...formData });
      } else {
        const res = await createPatient(formData, user);
        toast.success(`Patient registered successfully! OP Number: ${res.opNumber}`);
        onSaved?.({ id: res.id, opNumber: res.opNumber, ...formData });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save patient:', err);
      toast.error(err.message || 'Could not save patient record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={isEdit ? `Edit Patient Profile: ${initialData.name}` : 'Register New Outpatient (OP)'}
      description={
        isEdit
          ? 'Update contact details, clinical profile, or medical alerts.'
          : 'Create a permanent medical record and assign a unique Outpatient (OP) Number.'
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            {isEdit ? 'Save Changes' : 'Register Patient & Generate OP'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Identity & Contact */}
        <div className="rounded-lg border border-ink-200 bg-white p-4">
          <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User className="size-4 text-emerald-600" /> 1. Patient Demographics & Identity
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextField
              label="Full Name"
              required
              placeholder="e.g. Meenakshi Sundaram"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            <TextField
              label="Primary Mobile Number"
              required
              placeholder="10-digit mobile (e.g. 9840123456)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />

            <TextField
              label="Alternate Phone"
              placeholder="Optional secondary contact"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              error={errors.alternatePhone}
            />

            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Age (Years)"
                required
                type="number"
                min="1"
                max="125"
                placeholder="e.g. 34"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                error={errors.age}
              />

              <SelectField
                label="Gender"
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                error={errors.gender}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </SelectField>
            </div>

            <SelectField
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            >
              <option value="">Unknown / Not Tested</option>
              <option value="A+">A +ve</option>
              <option value="A-">A -ve</option>
              <option value="B+">B +ve</option>
              <option value="B-">B -ve</option>
              <option value="O+">O +ve</option>
              <option value="O-">O -ve</option>
              <option value="AB+">AB +ve</option>
              <option value="AB-">AB -ve</option>
            </SelectField>

            <TextField
              label="Email Address"
              type="email"
              placeholder="Optional email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Department & Outpatient (OP) Number */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Stethoscope className="size-4 text-emerald-700" /> 2. Clinical Department & Outpatient (OP) Number
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Clinical Department / Practice"
              required
              value={formData.practiceType}
              onChange={(e) => handlePracticeChange(e.target.value)}
              disabled={Boolean(practiceScope)}
              hint={
                practiceScope
                  ? `Fixed to your assigned role: ${practiceScope}`
                  : 'Select Siddha, Dental, or Both if attending both clinics'
              }
            >
              <option value="ayurveda">Siddha Clinic</option>
              <option value="dental">Dental Speciality Clinic</option>
              <option value="both">Both (Siddha & Dental Integrated)</option>
            </SelectField>

            <TextField
              label="Outpatient (OP) Number"
              required
              placeholder="Auto-generated"
              value={formData.opNumber}
              onChange={(e) => setFormData({ ...formData, opNumber: e.target.value })}
              hint={
                generatingOp
                  ? 'Generating sequential OP ID...'
                  : 'Auto-assigned by system. Can be customized for paper card migration.'
              }
            />
          </div>
        </div>

        {/* Section 3: Critical Medical Alerts & Allergies */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-amber-600" /> 3. Medical Alerts, Drug Allergies & Chronic Conditions
          </h4>
          <p className="text-xs text-amber-800 mb-3">
            Critical for patient safety before prescribing Siddha medicines, antibiotics, painkillers, or local anesthesia.
          </p>

          <div className="space-y-4">
            {/* Drug Allergies */}
            <div>
              <TextField
                label="Known Drug Allergies"
                placeholder="e.g. Penicillin, NSAIDs, Sulfa, Dust, Latex..."
                value={formData.medicalHistory.allergies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medicalHistory: { ...formData.medicalHistory, allergies: e.target.value },
                  })
                }
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                <span className="text-ink-500 text-[11px] self-center mr-1">Quick click:</span>
                {COMMON_ALLERGIES.map((a) => {
                  const active = formData.medicalHistory.allergies?.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleTag('allergies', a)}
                      className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                        active
                          ? 'bg-rose-600 text-white font-semibold'
                          : 'bg-white text-ink-700 border border-ink-200 hover:bg-rose-50'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <TextField
                label="Systemic & Chronic Conditions"
                placeholder="e.g. Diabetes, Hypertension, Asthma, Cardiac..."
                value={formData.medicalHistory.chronicConditions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medicalHistory: {
                      ...formData.medicalHistory,
                      chronicConditions: e.target.value,
                    },
                  })
                }
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                <span className="text-ink-500 text-[11px] self-center mr-1">Quick click:</span>
                {CHRONIC_CONDITIONS.map((c) => {
                  const active = formData.medicalHistory.chronicConditions?.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleTag('chronicConditions', c)}
                      className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                        active
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'bg-white text-ink-700 border border-ink-200 hover:bg-amber-50'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Daily Medications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Current Daily Medications / Tablets"
                placeholder="e.g. Metformin 500mg, Telmisartan 40mg..."
                value={formData.medicalHistory.currentMedications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medicalHistory: {
                      ...formData.medicalHistory,
                      currentMedications: e.target.value,
                    },
                  })
                }
              />

              <TextField
                label="Habits / Lifestyle"
                placeholder="e.g. Tobacco chewing, Smoking, Betel leaf, None..."
                value={formData.medicalHistory.habits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medicalHistory: {
                      ...formData.medicalHistory,
                      habits: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Section 4: Specialty Specific Details (Siddha / Dental) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Siddha Profile */}
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-emerald-600" /> Siddha Udaliyal / Constitution
            </h4>
            <TextField
              label="Prakriti / Constitution Notes"
              placeholder="e.g. Vatha Udaliyal, prone to dry skin and constipation"
              value={formData.medicalHistory.siddhaProfile}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medicalHistory: {
                    ...formData.medicalHistory,
                    siddhaProfile: e.target.value,
                  },
                })
              }
            />
            <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
              {SIDDHA_CONSTITUTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      medicalHistory: {
                        ...formData.medicalHistory,
                        siddhaProfile: s,
                      },
                    })
                  }
                  className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Dental History */}
          <div className="rounded-lg border border-sky-200 bg-white p-4">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Stethoscope className="size-3.5 text-sky-600" /> Dental History & Symptoms
            </h4>
            <TextField
              label="Dental Complaints / Prior Treatment"
              placeholder="e.g. RCT done on lower molar, recurrent gum bleeding"
              value={formData.medicalHistory.dentalHistory}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medicalHistory: {
                    ...formData.medicalHistory,
                    dentalHistory: e.target.value,
                  },
                })
              }
            />
            <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
              {DENTAL_CONDITIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleTag('dentalHistory', d)}
                  className="rounded bg-sky-50 px-2 py-0.5 text-sky-900 border border-sky-200 hover:bg-sky-100"
                >
                  + {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Address & Emergency Contact */}
        <div className="rounded-lg border border-ink-200 bg-white p-4">
          <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-3">
            4. Address & Emergency Contact
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <TextField
                label="Street Address / Door No"
                placeholder="Door No, Street name, Area"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
            </div>

            <TextField
              label="City / Town"
              placeholder="e.g. Kumbakonam / Chennai"
              value={formData.address.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value },
                })
              }
            />

            <TextField
              label="District"
              placeholder="e.g. Thanjavur"
              value={formData.address.district}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, district: e.target.value },
                })
              }
            />

            <TextField
              label="State"
              value={formData.address.state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value },
                })
              }
            />

            <TextField
              label="Pincode"
              placeholder="6-digit pincode"
              value={formData.address.pincode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, pincode: e.target.value },
                })
              }
            />
          </div>

          <div className="mt-4 pt-3 border-t border-ink-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField
              label="Emergency Contact Name"
              placeholder="e.g. K. Sundaram (Spouse)"
              value={formData.emergencyContact.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContact: {
                    ...formData.emergencyContact,
                    name: e.target.value,
                  },
                })
              }
            />

            <TextField
              label="Relationship"
              placeholder="e.g. Spouse / Parent / Son"
              value={formData.emergencyContact.relation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContact: {
                    ...formData.emergencyContact,
                    relation: e.target.value,
                  },
                })
              }
            />

            <TextField
              label="Emergency Phone"
              placeholder="10-digit mobile"
              value={formData.emergencyContact.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContact: {
                    ...formData.emergencyContact,
                    phone: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
