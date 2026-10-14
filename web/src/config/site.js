// Central, replaceable site configuration.
// Everything here is a DEFAULT: values stored in Firestore (settings/general and
// siteContent/*) override it at runtime through SiteContext. Contact details below
// are PLACEHOLDERS until the client supplies real ones.

export const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(
  /\/$/,
  "",
);

export const DEMO_ENABLED = false;

// Central brand identity — used for the site name, page titles, header, footer and SEO.
export const BRAND = {
  fullName: "SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE",
  short: "SREE AADHITYAA",
  descriptor: "Integrated Siddha and Dental Healthcare",
  shortDescriptor: "Siddha & Dental Healthcare",
};

export const PRACTICES = {
  ayurveda: {
    key: "ayurveda",
    name: "Shree Aadhitya Siddha Hospital",
    shortName: "Siddha Hospital",
    path: "/siddha",
    servicesPath: "/siddha/services",
    tagline: "Traditional Siddha care, personalised for you",
  },
  dental: {
    key: "dental",
    name: "Shree Aadhitya Dental Hospital",
    shortName: "Dental Hospital",
    path: "/dental",
    servicesPath: "/dental/services",
    tagline: "Modern, comfortable dental care for the whole family",
  },
};

export const DEFAULT_SETTINGS = {
  brand: {
    groupName: BRAND.fullName,
    developer: "Legendary One Technologies",
  },
  contact: {
    phone: "+91 94432 23456",
    whatsapp: "+91 94432 23456",
    email: "contact@sreeaadhityaa.com",
    address: "Sree Aadhityaa Integrated Siddha and Dental Healthcare, Main Road, Coimbatore, Tamil Nadu, India",
    workingHours: "Mon – Sat: 9:00 AM – 7:00 PM, Sun: 9:30 AM – 1:00 PM",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1920.3434634993496!2d77.24737390410193!3d11.506699337689767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba921000e590461%3A0xab17af8357a938c1!2sSree%20Aadithya%20Siddha%20Medical%20and%20Dental%20Care%20Centre!5e0!3m2!1sen!2sin!4v1791982499148!5m2!1sen!2sin",
  },
  social: { instagram: "", facebook: "", youtube: "" },
  currency: "INR",
  shipping: { enabled: true, flatFee: 60, freeAbove: 999 },
  lowStockThreshold: 5,
  paymentMethods: [
    {
      key: "cod",
      label: "Cash on delivery",
      help: "Pay in cash when your order is delivered.",
    },
    {
      key: "manual_transfer",
      label: "Pay by UPI / bank transfer",
      help: "We will contact you with payment details after confirming your order.",
    },
  ],
  appointments: {
    startTime: "09:30",
    endTime: "18:00",
    slotMinutes: 30,
    maxDaysAhead: 90,
  },
  disclaimer:
    "The information on this website is for general awareness only and is not a substitute for professional medical advice, diagnosis or treatment. Please consult a qualified doctor about your health.",
};

export const DEFAULT_CONTENT = {
  main: {
    hero: {
      eyebrow: "Siddha & Dental Healthcare",
      title: BRAND.fullName,
      subtitle:
        "Integrated Siddha and Dental care under one trusted roof, with online appointments and authentic herbal wellness products.",
      image: "/home-hero.png",
    },
    practicesOverview: {
      eyebrow: "Our practices",
      title: "Choose the care you need",
      subtitle: "Two hospitals with their own doctors, treatments and appointment booking.",
      siddhaTagline: "Traditional Siddha care, personalised for you",
      siddhaPoints: "Led by Dr. M. S. Rajamohan, MD (Siddha) NIS\nSpecialized pediatric, spine, joint & gastrointestinal care\nTraditional herbal & cosmetic products online",
      dentalTagline: "Modern, comfortable dental care for the whole family",
      dentalPoints: "Check-ups and preventive care\nRestorative and cosmetic treatments\nCare for children and adults",
    },


    herbalShowcase: {
      eyebrow: "Physician Formulations",
      title: "Herbal & Cosmetic Products",
      description: "Formulated under Siddha guidance with genuine botanicals for daily skin glow, pimple care, hair strength, and oral health.",
    },
    whyChoose: [
      {
        icon: "stethoscope",
        title: "Experienced care",
        text: "Consultations led by qualified practitioners in each discipline.",
      },
      {
        icon: "heart",
        title: "Patient-focused",
        text: "Time to listen, explain options and plan care around you.",
      },
      {
        icon: "building",
        title: "Modern facilities",
        text: "Clean, comfortable clinical spaces for every visit.",
      },
      {
        icon: "user",
        title: "Personalised consultation",
        text: "Recommendations tailored to your needs and history.",
      },
    ],
    appointmentCta: {
      title: "Book your appointment online",
      text: "Choose a practice, doctor and preferred time. Our team will confirm your request.",
    },
    about: {
      title: `About ${BRAND.short}`,
      body: `Sree Aadhityaa Integrated Siddha and Dental Healthcare brings together authentic traditional healing systems and modern dental sciences. Our experienced physicians and surgeons provide compassionate, individualized care designed for total wellness.`,
    },
  },
  ayurveda: {
    hero: {
      title: "Shree Aadhitya Siddha Hospital",
      subtitle:
        "Consultations and classical therapies guided by experienced Siddha physicians, tailored to your holistic health.",
      image: "/icons/logo-siddha.jpeg",
    },
    about: {
      title: "Authentic, Personalised Traditional Healing",
      body: "Our Siddha hospital combines time-tested therapies, genuine herbal medicines, and personalized dietary guidance in a calm, modern clinical setting.",
      image: "/ayurveda-about.png",
    },
    contact: {},
  },
  dental: {
    hero: {
      title: "Shree Aadhitya Dental Hospital",
      subtitle:
        "Preventive, restorative, aesthetic, and surgical dental care in a pristine, comfortable, and modern clinical environment.",
      image: "/icons/logo-dental.jpeg",
    },
    about: {
      title: "Comprehensive Dental Care That Puts You at Ease",
      body: "Our modern dental hospital offers comprehensive dental treatments for children and adults. We prioritize patient comfort, strict hygiene protocols, and long-lasting dental health.",
      image: "/dental-about.png",
    },
    facilities: [
      {
        title: "Modern equipment",
        text: "Up-to-date dental equipment designed for precision, patient comfort and efficient treatment.",
        image: "/fac-dental-equipment.png",
      },
      {
        title: "Sterilisation & hygiene",
        text: "Rigorous multi-step sterilisation and hygiene protocols ensuring a clean, safe clinical environment.",
        image: "/fac-dental-sterilisation.png",
      },
      {
        title: "Comfortable treatment rooms",
        text: "Calm, private spaces equipped to help you feel relaxed and completely at ease during every procedure.",
        image: "/fac-dental-rooms.png",
      },
    ],
    contact: {},
  },
};
