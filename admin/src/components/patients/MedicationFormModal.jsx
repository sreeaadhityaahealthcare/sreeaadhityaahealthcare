import { useEffect, useState } from 'react';
import { Pill } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { SelectField, TextAreaField, TextField, Toggle } from '../ui/FormField';
import { createMedication, updateMedication } from '../../services/medicationService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function MedicationFormModal({
  open,
  onClose,
  initialData = null,
  prefillPractice = 'dental',
  onSaved,
}) {
  const { user, practiceScope } = useAuth();
  const toast = useToast();

  const isEdit = Boolean(initialData?.id);
  const effectivePractice = practiceScope || initialData?.practiceType || prefillPractice || 'dental';

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    practiceType: effectivePractice,
    type: 'tablet',
    strength: '',
    defaultDosage: '1 tablet',
    defaultFrequency: '1-0-1',
    defaultTiming: 'after_food',
    defaultAnupanam: 'With warm water',
    duration: '5 days',
    instructions: '',
    indications: '',
    stockQuantity: 100,
    unit: 'tablets',
    active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        genericName: initialData.genericName || '',
        practiceType: initialData.practiceType || effectivePractice,
        type: initialData.type || 'tablet',
        strength: initialData.strength || '',
        defaultDosage: initialData.defaultDosage || '1 tablet',
        defaultFrequency: initialData.defaultFrequency || '1-0-1',
        defaultTiming: initialData.defaultTiming || 'after_food',
        defaultAnupanam: initialData.defaultAnupanam || 'With warm water',
        duration: initialData.duration || '5 days',
        instructions: initialData.instructions || '',
        indications: initialData.indications || '',
        stockQuantity: initialData.stockQuantity ?? 100,
        unit: initialData.unit || 'tablets',
        active: initialData.active ?? true,
      });
    } else {
      setFormData({
        name: '',
        genericName: '',
        practiceType: effectivePractice,
        type: 'tablet',
        strength: '',
        defaultDosage: '1 tablet',
        defaultFrequency: '1-0-1',
        defaultTiming: 'after_food',
        defaultAnupanam: 'With warm water',
        duration: '5 days',
        instructions: '',
        indications: '',
        stockQuantity: 100,
        unit: 'tablets',
        active: true,
      });
    }
    setErrors({});
  }, [open, initialData, effectivePractice]);

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Medicine name is required.';
    if (!formData.practiceType) errs.practiceType = 'Department is required.';
    if (!formData.type) errs.type = 'Formulation type is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateMedication(initialData.id, formData, user);
        toast.success(`Updated ${formData.name}`);
        onSaved?.({ id: initialData.id, ...formData });
      } else {
        const id = await createMedication(formData, user);
        toast.success(`Added ${formData.name} to formulary`);
        onSaved?.({ id, ...formData });
      }
      onClose();
    } catch (err) {
      console.error('Error saving medication:', err);
      toast.error(err.message || 'Could not save medication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? `Edit Medicine: ${initialData.name}` : 'Add New Medicine / Tablet to Formulary'}
      description="Define formulation, default dosage, frequency, and stock details for quick clinical prescribing."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="bg-teal-700 hover:bg-teal-800"
          >
            {isEdit ? 'Save Changes' : 'Add to Formulary'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Medicine / Tablet Name"
            required
            placeholder="e.g. Amoxicillin 500mg or Amukkara Choornam"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />

          <TextField
            label="Generic / Composition Name"
            placeholder="e.g. Amoxicillin Trihydrate / Withania somnifera"
            value={formData.genericName}
            onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
          />

          <SelectField
            label="Department / Practice"
            required
            value={formData.practiceType}
            onChange={(e) => setFormData({ ...formData, practiceType: e.target.value })}
            disabled={Boolean(practiceScope)}
          >
            <option value="ayurveda">Siddha Clinic</option>
            <option value="dental">Dental Clinic</option>
            <option value="both">Both (Shared Formulary)</option>
          </SelectField>

          <SelectField
            label="Formulation Type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="tablet">Tablet (Tab)</option>
            <option value="capsule">Capsule (Cap)</option>
            <option value="syrup">Syrup (Syr)</option>
            <option value="kashayam">Kashayam / Kudineer</option>
            <option value="choornam">Choornam (Powder)</option>
            <option value="lehyam">Lehyam (Jam)</option>
            <option value="thailam">Thailam (Oil)</option>
            <option value="ointment_gel">Ointment / Dental Gel</option>
            <option value="mouthwash">Mouthwash</option>
            <option value="drops">Drops</option>
            <option value="powder">Powder</option>
            <option value="other">Other</option>
          </SelectField>

          <TextField
            label="Strength / Concentration"
            placeholder="e.g. 500mg / 650mg / 0.2% w/v"
            value={formData.strength}
            onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
          />

          <TextField
            label="Default Dosage"
            placeholder="e.g. 1 tablet / 5g / 10ml"
            value={formData.defaultDosage}
            onChange={(e) => setFormData({ ...formData, defaultDosage: e.target.value })}
          />

          <SelectField
            label="Default Frequency"
            value={formData.defaultFrequency}
            onChange={(e) => setFormData({ ...formData, defaultFrequency: e.target.value })}
          >
            <option value="1-0-1">1-0-1 (Morning & Night)</option>
            <option value="1-1-1">1-1-1 (Morning, Noon & Night)</option>
            <option value="1-0-0">1-0-0 (Morning only)</option>
            <option value="0-0-1">0-0-1 (Night only)</option>
            <option value="0-1-0">0-1-0 (Afternoon only)</option>
            <option value="SOS">SOS (As needed)</option>
            <option value="Once Daily">Once Daily</option>
            <option value="Stat">Stat (Single immediate dose)</option>
          </SelectField>

          <SelectField
            label="Default Relation to Food"
            value={formData.defaultTiming}
            onChange={(e) => setFormData({ ...formData, defaultTiming: e.target.value })}
          >
            <option value="after_food">After Food (Post-meal)</option>
            <option value="before_food">Before Food (Pre-meal)</option>
            <option value="empty_stomach">Empty Stomach</option>
            <option value="with_food">With Food</option>
            <option value="at_bedtime">At Bedtime</option>
          </SelectField>

          <TextField
            label="Vehicle / Anupanam (With...)"
            placeholder="e.g. With warm water / With honey / With warm milk"
            value={formData.defaultAnupanam}
            onChange={(e) => setFormData({ ...formData, defaultAnupanam: e.target.value })}
          />

          <TextField
            label="Default Course Duration"
            placeholder="e.g. 5 days / 15 days"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />

          <TextField
            label="Stock Quantity Available"
            type="number"
            placeholder="e.g. 200"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
          />

          <TextField
            label="Stock Unit"
            placeholder="e.g. tablets / capsules / bottles / packets"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </div>

        <TextField
          label="Clinical Indications / Used For"
          placeholder="e.g. Dental abscess, fever, joint pain, gum bleeding..."
          value={formData.indications}
          onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
        />

        <TextAreaField
          label="Usage Instructions / Warnings"
          rows={2}
          placeholder="e.g. Take strictly after meals. Do not chew. Avoid alcohol..."
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
        />

        <Toggle
          label="Active in Formulary"
          description="Inactive medications will be hidden from prescription suggestions."
          checked={formData.active}
          onChange={(checked) => setFormData({ ...formData, active: checked })}
        />
      </form>
    </Modal>
  );
}
