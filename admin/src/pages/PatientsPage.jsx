import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Heart,
  HelpCircle,
  History,
  Layers,
  MapPin,
  Pill,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Button, { IconButton } from '../components/ui/Button';
import { Badge, PracticeBadge, StatusBadge } from '../components/ui/Badges';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable from '../components/ui/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '../components/ui/Filters';
import { EmptyState, ErrorState, TableSkeleton } from '../components/ui/States';
import PatientDetailsView from '../components/patients/PatientDetailsView';
import PatientFormModal from '../components/patients/PatientFormModal';
import OpVisitModal from '../components/patients/OpVisitModal';
import PrescriptionModal from '../components/patients/PrescriptionModal';
import PrescriptionPrintView from '../components/patients/PrescriptionPrintView';
import OpCardPrintView from '../components/patients/OpCardPrintView';
import MedicationFormModal from '../components/patients/MedicationFormModal';
import {
  deletePatient,
  getPatientCompleteDetails,
  listPatients,
  lookupPatientByPhone,
} from '../services/patientService';
import { listOpVisits } from '../services/opVisitService';
import { listPrescriptions } from '../services/prescriptionService';
import {
  deleteMedication,
  listMedications,
  seedDefaultMedicationsIfEmpty,
} from '../services/medicationService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  formatCurrency,
  formatDate,
  formatPhone,
  formatShortDate,
  formatTime,
  formatTimestamp,
  titleCase,
  todayISO,
} from '../utils/format';
import { normalizePhone } from '../utils/validators';

export default function PatientsPage() {
  const { user, practiceScope, isSuper } = useAuth();
  const toast = useToast();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState('lookup'); // 'lookup' | 'directory' | 'opd' | 'prescriptions' | 'formulary'

  // Phone lookup states
  const [phoneQuery, setPhoneQuery] = useState('');
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [lookupResult, setLookupResult] = useState(null); // { isOld, patient, cleanPhone, appointmentLead }

  // Directory states
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [practiceFilter, setPracticeFilter] = useState(practiceScope || 'all');

  // OPD Visits tab states
  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [visitSearch, setVisitSearch] = useState('');

  // Prescriptions tab states
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [rxSearch, setRxSearch] = useState('');

  // Formulary tab states
  const [formulary, setFormulary] = useState([]);
  const [loadingFormulary, setLoadingFormulary] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [seedingMeds, setSeedingMeds] = useState(false);

  // Active Modals & Viewers
  const [patientFormOpen, setPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [prefillPhone, setPrefillPhone] = useState('');

  const [opVisitOpen, setOpVisitOpen] = useState(false);
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState(null);

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [selectedPatientForRx, setSelectedPatientForRx] = useState(null);
  const [activeVisitIdForRx, setActiveVisitIdForRx] = useState(null);

  const [printRxData, setPrintRxData] = useState(null);
  const [printOpCardData, setPrintOpCardData] = useState(null);

  const [medModalOpen, setMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // 1. Initial Load of Patients, Visits, Prescriptions, Formulary
  const refreshPatients = async () => {
    setLoadingPatients(true);
    try {
      const data = await listPatients(practiceScope);
      setPatients(data);
    } catch (err) {
      console.warn('Could not list patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const refreshVisits = async () => {
    setLoadingVisits(true);
    try {
      const data = await listOpVisits(practiceScope);
      setVisits(data);
    } catch (err) {
      console.warn('Could not list OP visits:', err);
    } finally {
      setLoadingVisits(false);
    }
  };

  const refreshPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const data = await listPrescriptions(practiceScope);
      setPrescriptions(data);
    } catch (err) {
      console.warn('Could not list prescriptions:', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const refreshFormulary = async () => {
    setLoadingFormulary(true);
    try {
      const data = await listMedications(practiceScope);
      setFormulary(data);
    } catch (err) {
      console.warn('Could not list formulary:', err);
    } finally {
      setLoadingFormulary(false);
    }
  };

  useEffect(() => {
    refreshPatients();
  }, [practiceScope]);

  useEffect(() => {
    if (activeTab === 'opd') refreshVisits();
    if (activeTab === 'prescriptions') refreshPrescriptions();
    if (activeTab === 'formulary') refreshFormulary();
  }, [activeTab]);

  // Handle Phone Lookup Execution
  const handlePhoneLookup = async (phoneToSearch = phoneQuery) => {
    const clean = normalizePhone(phoneToSearch);
    if (!clean || clean.length !== 10) {
      toast.error('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSearchingPhone(true);
    try {
      const result = await lookupPatientByPhone(clean);

      if (result.isOld && result.patient?.id) {
        // Fetch complete details (visits + prescriptions + appointments)
        const full = await getPatientCompleteDetails(result.patient.id);
        setLookupResult({
          isOld: true,
          patient: full || result.patient,
          cleanPhone: clean,
        });
      } else {
        setLookupResult({
          isOld: false,
          patient: null,
          cleanPhone: clean,
          appointmentLead: result.appointmentLead,
        });
      }
    } catch (err) {
      console.error('Phone lookup failed:', err);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearchingPhone(false);
    }
  };

  // Quick auto-search when 10 digits are typed
  const onPhoneInputChange = (e) => {
    const val = e.target.value;
    setPhoneQuery(val);
    const clean = normalizePhone(val);
    if (clean.length === 10) {
      handlePhoneLookup(clean);
    } else if (clean.length < 10 && lookupResult) {
      setLookupResult(null);
    }
  };

  // Open full details of a patient from table
  const openPatientProfile = async (p) => {
    setIsSearchingPhone(true);
    try {
      const full = await getPatientCompleteDetails(p.id);
      setLookupResult({
        isOld: true,
        patient: full || p,
        cleanPhone: p.phone,
      });
      setActiveTab('lookup');
    } catch (err) {
      console.warn('Error fetching patient profile:', err);
    } finally {
      setIsSearchingPhone(false);
    }
  };

  // Seed default medications
  const handleSeedFormulary = async () => {
    setSeedingMeds(true);
    try {
      const res = await seedDefaultMedicationsIfEmpty(user);
      if (res.seeded) {
        toast.success(`Seeded ${res.count} standard Siddha & Dental medications!`);
        refreshFormulary();
      } else {
        toast.info('Formulary already contains items.');
      }
    } catch (err) {
      toast.error('Could not seed formulary.');
    } finally {
      setSeedingMeds(false);
    }
  };

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    let list = patients;
    if (practiceFilter !== 'all') {
      list = list.filter(
        (p) => p.practiceType === practiceFilter || p.practiceType === 'both'
      );
    }
    const q = patientSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.opNumber && p.opNumber.toLowerCase().includes(q)) ||
        (p.address?.city && p.address.city.toLowerCase().includes(q))
    );
  }, [patients, practiceFilter, patientSearch]);

  // Filtered Visits List
  const filteredVisits = useMemo(() => {
    const q = visitSearch.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter(
      (v) =>
        (v.patientName && v.patientName.toLowerCase().includes(q)) ||
        (v.opNumber && v.opNumber.toLowerCase().includes(q)) ||
        (v.doctorName && v.doctorName.toLowerCase().includes(q)) ||
        (v.chiefComplaints && v.chiefComplaints.toLowerCase().includes(q))
    );
  }, [visits, visitSearch]);

  // Filtered Prescriptions List
  const filteredPrescriptions = useMemo(() => {
    const q = rxSearch.trim().toLowerCase();
    if (!q) return prescriptions;
    return prescriptions.filter(
      (rx) =>
        (rx.patientName && rx.patientName.toLowerCase().includes(q)) ||
        (rx.prescriptionNumber && rx.prescriptionNumber.toLowerCase().includes(q)) ||
        (rx.opNumber && rx.opNumber.toLowerCase().includes(q)) ||
        (rx.doctorName && rx.doctorName.toLowerCase().includes(q)) ||
        (rx.items && rx.items.some((i) => i.name?.toLowerCase().includes(q)))
    );
  }, [prescriptions, rxSearch]);

  // Filtered Formulary List
  const filteredFormulary = useMemo(() => {
    const q = medSearch.trim().toLowerCase();
    if (!q) return formulary;
    return formulary.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.genericName && m.genericName.toLowerCase().includes(q)) ||
        (m.indications && m.indications.toLowerCase().includes(q))
    );
  }, [formulary, medSearch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Patient & Outpatient (OPD) Management"
        description="Comprehensive clinical records, outpatient numbering, instant phone status check, consultation history, and prescription builder for Siddha and Dental specialties."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEditingPatient(null);
                setPrefillPhone('');
                setPatientFormOpen(true);
              }}
              className="gap-1.5"
            >
              <UserPlus className="size-4" /> Register New Patient
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (lookupResult?.isOld && lookupResult.patient) {
                  setSelectedPatientForVisit(lookupResult.patient);
                  setOpVisitOpen(true);
                } else {
                  setActiveTab('lookup');
                  toast.info('Enter patient phone number or select a patient from Directory.');
                }
              }}
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800"
            >
              <Stethoscope className="size-4" /> Start OP Consultation
            </Button>
          </div>
        }
      />

      {/* Primary Navigation Tabs */}
      <div className="border-b border-ink-200">
        <nav className="flex space-x-6 overflow-x-auto text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-2 border-b-2 py-3 transition-colors ${
              activeTab === 'lookup'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <Phone className="size-4 text-emerald-600" />
            Fast Phone Lookup & Check-In
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 border-b-2 py-3 transition-colors ${
              activeTab === 'directory'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <Users className="size-4" />
            Patients Database ({patients.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('opd')}
            className={`flex items-center gap-2 border-b-2 py-3 transition-colors ${
              activeTab === 'opd'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <ClipboardList className="size-4" />
            OPD Register / Visits ({visits.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prescriptions')}
            className={`flex items-center gap-2 border-b-2 py-3 transition-colors ${
              activeTab === 'prescriptions'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <Pill className="size-4" />
            Prescriptions & Tablets ({prescriptions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formulary')}
            className={`flex items-center gap-2 border-b-2 py-3 transition-colors ${
              activeTab === 'formulary'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <Sparkles className="size-4" />
            Medicines Master Formulary ({formulary.length})
          </button>
        </nav>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: FAST PHONE NUMBER LOOKUP & INSTANT OPD CHECK-IN         */}
      {/* ============================================================== */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          {/* High-Contrast Phone Search Engine Card */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 p-6 shadow-sm">
            <div className="max-w-2xl mx-auto text-center mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <Sparkles className="size-3.5" /> Instant Patient Check-in Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-ink-950">
                Enter Mobile Number to Check Patient Status
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 mt-1">
                Instantly displays whether the patient is an <strong className="text-emerald-700">OLD PATIENT</strong> (with complete medical history, past OP visits, and prescriptions) or a <strong className="text-sky-700">NEW PATIENT</strong> ready for 1-click registration.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePhoneLookup();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <span className="text-xs font-bold text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={phoneQuery}
                    onChange={onPhoneInputChange}
                    placeholder="Enter 10-digit mobile number... (e.g. 9840123456)"
                    className="block w-full rounded-xl border-2 border-ink-300 bg-white py-3 pl-14 pr-10 text-base font-semibold text-ink-900 placeholder:text-ink-400 placeholder:font-normal focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-inner"
                    autoFocus
                  />
                  {phoneQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneQuery('');
                        setLookupResult(null);
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-400 hover:text-ink-700"
                    >
                      <X className="size-5" />
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={isSearchingPhone}
                  className="h-12 px-6 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-800 shadow-md gap-2"
                >
                  <Search className="size-5" /> Check Patient
                </Button>
              </form>
            </div>
          </div>

          {/* Result 1: OLD PATIENT FOUND */}
          {lookupResult?.isOld && lookupResult.patient && (
            <PatientDetailsView
              patient={lookupResult.patient}
              onNewVisit={(p) => {
                setSelectedPatientForVisit(p);
                setOpVisitOpen(true);
              }}
              onWritePrescription={(p) => {
                setSelectedPatientForRx(p);
                setActiveVisitIdForRx(null);
                setPrescriptionOpen(true);
              }}
              onEdit={(p) => {
                setEditingPatient(p);
                setPatientFormOpen(true);
              }}
              onPrintCard={(p) => setPrintOpCardData(p)}
              onViewPrescription={(rx) => setPrintRxData(rx)}
              onRefresh={() => handlePhoneLookup(lookupResult.cleanPhone)}
            />
          )}

          {/* Result 2: NEW PATIENT NOT FOUND */}
          {lookupResult && !lookupResult.isOld && (
            <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/60 p-8 text-center max-w-2xl mx-auto shadow-sm">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md mb-3">
                <UserPlus className="size-7" />
              </div>

              <div className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
                NEW PATIENT RECORD
              </div>

              <h3 className="text-xl font-bold text-ink-950">
                No Existing Record for {formatPhone(lookupResult.cleanPhone)}
              </h3>
              <p className="mt-1 text-sm text-ink-600 max-w-md mx-auto">
                This mobile number is not registered in our outpatient database. Register them now to generate an automatic Outpatient (OP) Number and begin their clinical record.
              </p>

              {lookupResult.appointmentLead && (
                <div className="mt-4 p-3 rounded-lg border border-teal-200 bg-teal-50 text-xs text-teal-950 text-left max-w-md mx-auto">
                  <p className="font-bold text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-teal-600" />
                    Online Appointment Lead Found:
                  </p>
                  <p className="mt-1">
                    <strong>{lookupResult.appointmentLead.patientName}</strong> has booked a{' '}
                    <strong>{lookupResult.appointmentLead.serviceName || 'Consultation'}</strong> on{' '}
                    {formatDate(lookupResult.appointmentLead.preferredDate)}.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setEditingPatient(
                      lookupResult.appointmentLead
                        ? {
                            name: lookupResult.appointmentLead.patientName,
                            phone: lookupResult.cleanPhone,
                            email: lookupResult.appointmentLead.email,
                            practiceType: lookupResult.appointmentLead.practiceType || 'ayurveda',
                          }
                        : null
                    );
                    setPrefillPhone(lookupResult.cleanPhone);
                    setPatientFormOpen(true);
                  }}
                  className="gap-2 bg-sky-700 hover:bg-sky-800 font-bold"
                >
                  <UserPlus className="size-5" /> Register as New Patient Now
                </Button>
              </div>
            </div>
          )}

          {/* Default Guide when no phone entered */}
          {!lookupResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-ink-600">
              <div className="rounded-xl border border-ink-200 bg-white p-4">
                <div className="size-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2">
                  1
                </div>
                <h4 className="font-bold text-ink-900 text-sm">Instant Phone Recognition</h4>
                <p className="mt-1">
                  Type any 10-digit mobile number. The system queries the patient database in real-time.
                </p>
              </div>

              <div className="rounded-xl border border-ink-200 bg-white p-4">
                <div className="size-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2">
                  2
                </div>
                <h4 className="font-bold text-ink-900 text-sm">Both Siddha & Dental</h4>
                <p className="mt-1">
                  Comprehensive profiles, Naadi examination, Dental tooth charting, and emergency drug allergy alerts.
                </p>
              </div>

              <div className="rounded-xl border border-ink-200 bg-white p-4">
                <div className="size-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <h4 className="font-bold text-ink-900 text-sm">OP Numbers & Prescriptions</h4>
                <p className="mt-1">
                  Sequential OP numbers (e.g. OP-SID-26-0001) and 1-click printable hospital prescription slips.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PATIENTS DATABASE / COMPLETE ROSTER                     */}
      {/* ============================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <FilterBar>
            <div className="flex-1 min-w-[240px]">
              <SearchInput
                value={patientSearch}
                onChange={setPatientSearch}
                placeholder="Search by Patient Name, Mobile, OP Number, City..."
              />
            </div>

            <FilterSelect
              label="Practice"
              value={practiceFilter}
              onChange={setPracticeFilter}
              disabled={Boolean(practiceScope)}
            >
              <option value="all">All Specialties</option>
              <option value="ayurveda">Siddha Clinic</option>
              <option value="dental">Dental Clinic</option>
            </FilterSelect>

            <Button
              variant="secondary"
              onClick={refreshPatients}
              loading={loadingPatients}
              title="Refresh"
              className="gap-1.5"
            >
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </FilterBar>

          <DataTable
            rows={filteredPatients}
            loading={loadingPatients}
            onRowClick={(p) => openPatientProfile(p)}
            columns={[
              {
                key: 'opNumber',
                header: 'OP Number',
                className: 'font-mono font-bold text-emerald-800 text-xs',
                render: (p) => p.opNumber || '—',
              },
              {
                key: 'name',
                header: 'Patient Name',
                render: (p) => (
                  <div>
                    <span className="font-bold text-ink-950 text-sm">{p.name}</span>
                    {p.medicalHistory?.allergies && (
                      <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                        Allergies
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'phone',
                header: 'Mobile Number',
                render: (p) => formatPhone(p.phone),
              },
              {
                key: 'demographics',
                header: 'Age / Gender',
                render: (p) => (
                  <span className="text-ink-700">
                    {p.age ? `${p.age}y` : '—'} · {p.gender ? titleCase(p.gender) : '—'}
                  </span>
                ),
              },
              {
                key: 'practiceType',
                header: 'Department',
                render: (p) => <PracticeBadge practice={p.practiceType} />,
              },
              {
                key: 'bloodGroup',
                header: 'Blood Group',
                render: (p) =>
                  p.bloodGroup ? (
                    <span className="font-semibold text-rose-700">{p.bloodGroup}</span>
                  ) : (
                    '—'
                  ),
              },
              {
                key: 'visits',
                header: 'Total Visits',
                className: 'tabular-nums text-center',
                render: (p) => p.totalVisits || 0,
              },
              {
                key: 'lastVisit',
                header: 'Last Visit',
                render: (p) => (p.lastVisitDate ? formatShortDate(p.lastVisitDate) : '—'),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (p) => (
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      label="View Profile"
                      onClick={() => openPatientProfile(p)}
                    >
                      <Eye className="size-4" />
                    </IconButton>
                    <IconButton
                      label="New OP Visit"
                      onClick={() => {
                        setSelectedPatientForVisit(p);
                        setOpVisitOpen(true);
                      }}
                    >
                      <Stethoscope className="size-4 text-emerald-600" />
                    </IconButton>
                    <IconButton
                      label="Write Prescription"
                      onClick={() => {
                        setSelectedPatientForRx(p);
                        setActiveVisitIdForRx(null);
                        setPrescriptionOpen(true);
                      }}
                    >
                      <Pill className="size-4 text-teal-600" />
                    </IconButton>
                    <IconButton
                      label="Edit"
                      onClick={() => {
                        setEditingPatient(p);
                        setPatientFormOpen(true);
                      }}
                    >
                      <User className="size-4" />
                    </IconButton>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: OPD REGISTER / TODAY'S OUTPATIENTS                      */}
      {/* ============================================================== */}
      {activeTab === 'opd' && (
        <div className="space-y-4">
          <FilterBar>
            <div className="flex-1 min-w-[240px]">
              <SearchInput
                value={visitSearch}
                onChange={setVisitSearch}
                placeholder="Search OP visits by patient name, OP number, doctor, complaints..."
              />
            </div>
            <Button
              variant="secondary"
              onClick={refreshVisits}
              loading={loadingVisits}
              className="gap-1.5"
            >
              <RefreshCw className="size-4" /> Refresh OPD
            </Button>
          </FilterBar>

          <DataTable
            rows={filteredVisits}
            loading={loadingVisits}
            columns={[
              {
                key: 'token',
                header: 'Token #',
                className: 'font-bold text-center w-14',
                render: (v) => (
                  <span className="flex size-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold mx-auto">
                    #{v.tokenNumber || '1'}
                  </span>
                ),
              },
              {
                key: 'date',
                header: 'Date & Time',
                render: (v) => (
                  <div>
                    <span className="font-semibold text-ink-900">{formatShortDate(v.visitDate)}</span>
                    <div className="text-[11px] text-ink-400">{v.visitTime}</div>
                  </div>
                ),
              },
              {
                key: 'opNumber',
                header: 'OP Number',
                className: 'font-mono text-xs font-bold text-ink-800',
                render: (v) => v.opNumber || '—',
              },
              {
                key: 'patient',
                header: 'Patient Name',
                render: (v) => (
                  <div>
                    <span className="font-bold text-ink-950">{v.patientName}</span>
                    <div className="text-[11px] text-ink-500">{formatPhone(v.patientPhone)}</div>
                  </div>
                ),
              },
              {
                key: 'practiceType',
                header: 'Department',
                render: (v) => <PracticeBadge practice={v.practiceType} />,
              },
              {
                key: 'doctor',
                header: 'Consulting Doctor',
                render: (v) => `Dr. ${v.doctorName || 'Doctor'}`,
              },
              {
                key: 'complaints',
                header: 'Complaints / Diagnosis',
                render: (v) => (
                  <div className="max-w-xs truncate">
                    <p className="font-medium text-ink-900 truncate">{v.chiefComplaints}</p>
                    {v.finalDiagnosis && (
                      <p className="text-[11px] text-emerald-800 font-medium truncate">
                        {v.finalDiagnosis}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: 'vitals',
                header: 'Vitals',
                render: (v) => (
                  <div className="text-[11px] text-ink-600">
                    {v.vitals?.bp && <div>BP: {v.vitals.bp}</div>}
                    {v.vitals?.pulse && <div>P: {v.vitals.pulse} bpm</div>}
                  </div>
                ),
              },
              {
                key: 'fee',
                header: 'OP Fee',
                className: 'tabular-nums font-medium',
                render: (v) => (v.consultationFee ? formatCurrency(v.consultationFee) : 'Free'),
              },
            ]}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PRESCRIPTIONS & TABLET SLIPS                            */}
      {/* ============================================================== */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <FilterBar>
            <div className="flex-1 min-w-[240px]">
              <SearchInput
                value={rxSearch}
                onChange={setRxSearch}
                placeholder="Search prescriptions by Rx number, patient, doctor, tablet name..."
              />
            </div>
            <Button
              variant="secondary"
              onClick={refreshPrescriptions}
              loading={loadingPrescriptions}
              className="gap-1.5"
            >
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </FilterBar>

          <DataTable
            rows={filteredPrescriptions}
            loading={loadingPrescriptions}
            columns={[
              {
                key: 'rxNumber',
                header: 'Rx Number',
                className: 'font-mono font-bold text-xs text-teal-800',
                render: (rx) => rx.prescriptionNumber || '—',
              },
              {
                key: 'date',
                header: 'Date',
                render: (rx) => formatShortDate(rx.date),
              },
              {
                key: 'patient',
                header: 'Patient Details',
                render: (rx) => (
                  <div>
                    <span className="font-bold text-ink-950">{rx.patientName}</span>
                    <div className="text-[11px] text-ink-500">
                      OP: {rx.opNumber} · {formatPhone(rx.patientPhone)}
                    </div>
                  </div>
                ),
              },
              {
                key: 'practiceType',
                header: 'Department',
                render: (rx) => <PracticeBadge practice={rx.practiceType} />,
              },
              {
                key: 'doctor',
                header: 'Prescribing Doctor',
                render: (rx) => `Dr. ${rx.doctorName || 'Doctor'}`,
              },
              {
                key: 'medications',
                header: 'Prescribed Medicines / Tablets',
                render: (rx) => (
                  <div className="max-w-xs text-xs space-y-0.5">
                    {(rx.items || []).slice(0, 3).map((item, i) => (
                      <div key={i} className="truncate">
                        <strong className="text-ink-900">{item.name}</strong> ({item.frequency || '1-0-1'})
                      </div>
                    ))}
                    {(rx.items?.length || 0) > 3 && (
                      <span className="text-[10px] text-teal-700 font-semibold">
                        + {rx.items.length - 3} more medicines
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'actions',
                header: 'Print / View',
                className: 'text-right',
                render: (rx) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPrintRxData(rx)}
                    className="gap-1.5 text-xs border-teal-300 text-teal-800 bg-teal-50/60 hover:bg-teal-100"
                  >
                    <Printer className="size-3.5" /> Print Rx Slip
                  </Button>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: MEDICINES & TABLETS FORMULARY MASTER                    */}
      {/* ============================================================== */}
      {activeTab === 'formulary' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink-900">
                Hospital Medicines & Tablet Formulary
              </h3>
              <p className="text-xs text-ink-500">
                Master catalog of Siddha and Dental tablets, formulations, stock counts, and dosage rules for auto-filling prescriptions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSeedFormulary}
                loading={seedingMeds}
                className="gap-1.5 border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100"
              >
                <Sparkles className="size-3.5" /> Seed Default Formulary
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingMed(null);
                  setMedModalOpen(true);
                }}
                className="gap-1.5 bg-teal-700 hover:bg-teal-800"
              >
                <Plus className="size-4" /> Add Medicine / Tablet
              </Button>
            </div>
          </div>

          <FilterBar>
            <div className="flex-1 min-w-[240px]">
              <SearchInput
                value={medSearch}
                onChange={setMedSearch}
                placeholder="Search formulary by medicine name, composition, indications..."
              />
            </div>
            <Button
              variant="secondary"
              onClick={refreshFormulary}
              loading={loadingFormulary}
              className="gap-1.5"
            >
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </FilterBar>

          <DataTable
            rows={filteredFormulary}
            loading={loadingFormulary}
            columns={[
              {
                key: 'name',
                header: 'Medicine / Tablet Name',
                render: (m) => (
                  <div>
                    <span className="font-bold text-ink-950 text-sm">{m.name}</span>
                    {m.genericName && (
                      <div className="text-[11px] text-ink-500">{m.genericName}</div>
                    )}
                  </div>
                ),
              },
              {
                key: 'practiceType',
                header: 'Department',
                render: (m) => <PracticeBadge practice={m.practiceType} />,
              },
              {
                key: 'type',
                header: 'Formulation',
                render: (m) => (
                  <span className="rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800">
                    {titleCase(m.type)} {m.strength ? `· ${m.strength}` : ''}
                  </span>
                ),
              },
              {
                key: 'dosage',
                header: 'Default Dose & Freq',
                render: (m) => (
                  <div className="text-xs">
                    <span className="font-semibold text-teal-800">{m.defaultFrequency || '1-0-1'}</span>
                    <div className="text-[11px] text-ink-500">{m.defaultDosage || '1 dose'} · {m.defaultTiming ? titleCase(m.defaultTiming) : 'After food'}</div>
                  </div>
                ),
              },
              {
                key: 'indications',
                header: 'Clinical Indications',
                render: (m) => (
                  <span className="text-xs text-ink-700 line-clamp-2 max-w-xs">
                    {m.indications || '—'}
                  </span>
                ),
              },
              {
                key: 'stock',
                header: 'Stock Quantity',
                className: 'tabular-nums',
                render: (m) => (
                  <span className="font-bold text-ink-900">
                    {m.stockQuantity ?? 100} {m.unit || 'units'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (m) => (
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      label="Edit"
                      onClick={() => {
                        setEditingMed(m);
                        setMedModalOpen(true);
                      }}
                    >
                      <User className="size-4" />
                    </IconButton>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS & PRINT VIEWERS                                         */}
      {/* ============================================================== */}

      {/* 1. Register / Edit Patient Modal */}
      {patientFormOpen && (
        <PatientFormModal
          open={patientFormOpen}
          onClose={() => {
            setPatientFormOpen(false);
            setEditingPatient(null);
          }}
          initialData={editingPatient}
          prefillPhone={prefillPhone}
          onSaved={(saved) => {
            refreshPatients();
            // Automatically select and show in lookup view
            openPatientProfile(saved);
          }}
        />
      )}

      {/* 2. Outpatient (OP) Consultation Visit Modal */}
      {opVisitOpen && selectedPatientForVisit && (
        <OpVisitModal
          open={opVisitOpen}
          onClose={() => {
            setOpVisitOpen(false);
            setSelectedPatientForVisit(null);
          }}
          patient={selectedPatientForVisit}
          onSaved={(savedVisit, writeRxNow) => {
            refreshVisits();
            // Refresh patient details in lookup view
            openPatientProfile(selectedPatientForVisit);

            // If user checked "Write prescription immediately", open Rx modal
            if (writeRxNow) {
              setSelectedPatientForRx(selectedPatientForVisit);
              setActiveVisitIdForRx(savedVisit.id);
              setPrescriptionOpen(true);
            }
          }}
        />
      )}

      {/* 3. Prescription Builder Modal */}
      {prescriptionOpen && selectedPatientForRx && (
        <PrescriptionModal
          open={prescriptionOpen}
          onClose={() => {
            setPrescriptionOpen(false);
            setSelectedPatientForRx(null);
            setActiveVisitIdForRx(null);
          }}
          patient={selectedPatientForRx}
          visitId={activeVisitIdForRx}
          onSaved={(savedRx, andPrint) => {
            refreshPrescriptions();
            openPatientProfile(selectedPatientForRx);
            if (andPrint) {
              setPrintRxData(savedRx);
            }
          }}
        />
      )}

      {/* 4. Prescription Print View */}
      {printRxData && (
        <PrescriptionPrintView
          prescription={printRxData}
          onClose={() => setPrintRxData(null)}
        />
      )}

      {/* 5. OP Card Print View */}
      {printOpCardData && (
        <OpCardPrintView
          patient={printOpCardData}
          onClose={() => setPrintOpCardData(null)}
        />
      )}

      {/* 6. Formulary Add/Edit Modal */}
      {medModalOpen && (
        <MedicationFormModal
          open={medModalOpen}
          onClose={() => {
            setMedModalOpen(false);
            setEditingMed(null);
          }}
          initialData={editingMed}
          onSaved={() => refreshFormulary()}
        />
      )}
    </div>
  );
}
