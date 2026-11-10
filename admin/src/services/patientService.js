import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapDoc } from './crud';
import { normalizePhone } from '../utils/validators';

const colRef = () => collection(db, 'patients');

/**
 * Generate a clean, unique Outpatient (OP) Number.
 * Format: OP-SID-26-0001 (Siddha), OP-DEN-26-0001 (Dental), OP-AAH-26-0001 (Both/General).
 */
export async function generateNextOpNumber(practiceType = 'ayurveda') {
  const prefixMap = {
    ayurveda: 'OP-SID',
    dental: 'OP-DEN',
    both: 'OP-AAH',
  };
  const prefix = prefixMap[practiceType] || 'OP-AAH';
  const yearSuffix = new Date().getFullYear().toString().slice(-2); // "26"

  try {
    const q = query(
      colRef(),
      orderBy('createdAt', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    
    // Find highest matching sequence for current year
    let maxSeq = 0;
    const regex = new RegExp(`^${prefix}-${yearSuffix}-(\\d{4})$`);
    
    snap.docs.forEach((d) => {
      const opNum = d.data().opNumber || '';
      const match = opNum.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    });

    const nextSeq = String(maxSeq + 1).padStart(4, '0');
    return `${prefix}-${yearSuffix}-${nextSeq}`;
  } catch (err) {
    console.warn('Error computing next OP number, fallback to timestamp:', err);
    const fallbackSeq = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}-${yearSuffix}-${fallbackSeq}`;
  }
}

/**
 * Instant Phone Number Lookup:
 * Checks whether a patient exists by their 10-digit mobile number.
 * Returns:
 * {
 *   isOld: boolean,
 *   patient: PatientRecord | null,
 *   appointmentLead: AppointmentRecord | null // if found in appointment requests
 * }
 */
export async function lookupPatientByPhone(rawPhone) {
  const cleanPhone = normalizePhone(rawPhone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return { isOld: false, patient: null, cleanPhone: '' };
  }

  // 1. Check primary phone in 'patients' collection
  const primaryQuery = query(colRef(), where('phone', '==', cleanPhone), limit(1));
  const primarySnap = await getDocs(primaryQuery);

  if (!primarySnap.empty) {
    const patientDoc = mapDoc(primarySnap.docs[0]);
    return {
      isOld: true,
      patient: patientDoc,
      cleanPhone,
    };
  }

  // 2. Check alternate phone in 'patients' collection
  const altQuery = query(colRef(), where('alternatePhone', '==', cleanPhone), limit(1));
  const altSnap = await getDocs(altQuery);

  if (!altSnap.empty) {
    const patientDoc = mapDoc(altSnap.docs[0]);
    return {
      isOld: true,
      patient: patientDoc,
      cleanPhone,
    };
  }

  // 3. Not in registered patients database, check if they exist in online appointments
  let appointmentLead = null;
  try {
    const apptQuery = query(
      collection(db, 'appointments'),
      where('phone', '==', cleanPhone),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const apptSnap = await getDocs(apptQuery);
    if (!apptSnap.empty) {
      appointmentLead = mapDoc(apptSnap.docs[0]);
    }
  } catch (err) {
    // If composite index is pending, fallback to simple query
    try {
      const fallbackAppt = await getDocs(
        query(collection(db, 'appointments'), where('phone', '==', cleanPhone), limit(1))
      );
      if (!fallbackAppt.empty) {
        appointmentLead = mapDoc(fallbackAppt.docs[0]);
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    isOld: false,
    patient: null,
    cleanPhone,
    appointmentLead,
  };
}

/**
 * Fetch complete comprehensive details of a patient:
 * - Patient demographic and profile document
 * - All OP Visits / Consultations (ordered latest first)
 * - All Prescriptions (ordered latest first)
 * - Online appointment booking history
 */
export async function getPatientCompleteDetails(patientId) {
  const pDoc = await getDoc(doc(db, 'patients', patientId));
  if (!pDoc.exists()) return null;
  const patient = mapDoc(pDoc);

  // Fetch OP Visits
  let visits = [];
  try {
    const vSnap = await getDocs(
      query(
        collection(db, 'opVisits'),
        where('patientId', '==', patientId),
        limit(50)
      )
    );
    visits = vSnap.docs.map(mapDoc).sort((a, b) => (b.visitDate || '').localeCompare(a.visitDate || ''));
  } catch (err) {
    console.warn('Could not load OP visits:', err);
  }

  // Fetch Prescriptions
  let prescriptions = [];
  try {
    const rxSnap = await getDocs(
      query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        limit(50)
      )
    );
    prescriptions = rxSnap.docs.map(mapDoc).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (err) {
    console.warn('Could not load prescriptions:', err);
  }

  // Fetch Appointments
  let appointments = [];
  if (patient.phone) {
    try {
      const aSnap = await getDocs(
        query(
          collection(db, 'appointments'),
          where('phone', '==', patient.phone),
          limit(20)
        )
      );
      appointments = aSnap.docs.map(mapDoc);
    } catch (err) {
      console.warn('Could not load appointments:', err);
    }
  }

  return {
    ...patient,
    visits,
    prescriptions,
    appointments,
  };
}

/**
 * List patients, filterable by practice scope:
 * - ayurveda_admin sees ayurveda and both
 * - dental_admin sees dental and both
 * - super_admin sees all
 */
export async function listPatients(practiceScope, maxCount = 300) {
  try {
    const snap = await getDocs(
      query(colRef(), orderBy('createdAt', 'desc'), limit(maxCount))
    );
    const all = snap.docs.map(mapDoc);

    if (!practiceScope) return all;
    return all.filter(
      (p) => p.practiceType === practiceScope || p.practiceType === 'both'
    );
  } catch (err) {
    console.error('Error listing patients:', err);
    throw err;
  }
}

/**
 * Register a new patient.
 */
export async function createPatient(data, user) {
  const cleanPhone = normalizePhone(data.phone);
  const practiceType = data.practiceType || 'ayurveda';
  
  // Auto-generate OP number if not provided
  let opNumber = data.opNumber?.trim();
  if (!opNumber) {
    opNumber = await generateNextOpNumber(practiceType);
  }

  const payload = {
    ...data,
    phone: cleanPhone,
    alternatePhone: normalizePhone(data.alternatePhone) || '',
    opNumber,
    practiceType,
    status: data.status || 'active',
    totalVisits: Number(data.totalVisits) || 0,
    lastVisitDate: data.lastVisitDate || null,
    address: data.address || {
      street: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
    },
    emergencyContact: data.emergencyContact || {
      name: '',
      relation: '',
      phone: '',
    },
    medicalHistory: data.medicalHistory || {
      allergies: '',
      chronicConditions: '',
      currentMedications: '',
      pastSurgeries: '',
      habits: '',
      dentalHistory: '',
      siddhaProfile: '',
      notes: '',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user?.uid || 'staff',
    updatedBy: user?.uid || 'staff',
  };

  const ref = await addDoc(colRef(), payload);
  return { id: ref.id, opNumber };
}

/**
 * Update existing patient details.
 */
export async function updatePatient(id, data, user) {
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: user?.uid || 'staff',
  };
  if (data.phone) payload.phone = normalizePhone(data.phone);
  if (data.alternatePhone !== undefined) {
    payload.alternatePhone = normalizePhone(data.alternatePhone) || '';
  }

  await updateDoc(doc(db, 'patients', id), payload);
}

/**
 * Delete a patient (super_admin only).
 */
export async function deletePatient(id) {
  await deleteDoc(doc(db, 'patients', id));
}
