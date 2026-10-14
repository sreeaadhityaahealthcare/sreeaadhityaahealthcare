import { BRAND, SITE_URL } from "../config/site";

const DEFAULT_BASE_URL = SITE_URL || "https://sreeaadhityaahealthcare.com";

/**
 * Generates Schema.org MedicalClinic / MedicalBusiness / Dentist structured data.
 */
export function generateClinicSchema(settings = {}) {
  const c = settings?.contact || {};
  const phone = c.phone || "+91 94432 23456";
  const email = c.email || "contact@sreeaadhityaa.com";
  const addressText =
    c.address ||
    "Sree Aadhityaa Integrated Siddha and Dental Healthcare, Main Road, Tamil Nadu, India";

  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "Dentist", "LocalBusiness"],
    "@id": `${DEFAULT_BASE_URL}/#clinic`,
    name: BRAND.fullName,
    alternateName: [
      "Sree Aadhityaa Siddha Hospital",
      "Sree Aadhityaa Dental Hospital",
      "Shree Aadhitya Siddha Medical and Dental Care Centre",
    ],
    url: DEFAULT_BASE_URL,
    logo: `${DEFAULT_BASE_URL}/icons/logo-main.jpeg`,
    image: [
      `${DEFAULT_BASE_URL}/og-main.png`,
      `${DEFAULT_BASE_URL}/icons/logo-main.jpeg`,
      `${DEFAULT_BASE_URL}/icons/logo-siddha.jpeg`,
      `${DEFAULT_BASE_URL}/icons/logo-dental.jpeg`,
    ],
    description:
      "Integrated classical Siddha medicine and modern dental care centre led by expert physicians and dental surgeons in Tamil Nadu, India.",
    telephone: phone,
    email: email,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI, Debit Card, Net Banking",
    hasMap:
      c.mapUrl ||
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1920.3434634993496!2d77.24737390410193!3d11.506699337689767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba921000e590461%3A0xab17af8357a938c1!2sSree%20Aadithya%20Siddha%20Medical%20and%20Dental%20Care%20Centre!5e0!3m2!1sen!2sin!4v1791982499148!5m2!1sen!2sin",
    address: {
      "@type": "PostalAddress",
      streetAddress: addressText,
      addressLocality: "Gobichettipalayam",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 11.5066993,
      longitude: 77.2473739,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:30",
        closes: "13:00",
      },
    ],
    medicalSpecialty: [
      "https://schema.org/Dentistry",
      "Siddha Medicine",
      "Traditional Indian Medicine",
      "Pediatric Siddha Care",
      "Spine and Joint Disorders",
      "Gastrointestinal Care",
      "Cosmetic Dentistry",
      "Orthodontics",
    ],
    founder: {
      "@type": "Person",
      name: "Dr. M. S. Rajamohan",
      jobTitle: "Chief Siddha Physician",
      honorificSuffix: "MD (Siddha) NIS",
    },
    availableService: [
      {
        "@type": "MedicalTherapy",
        name: "Classical Siddha Medicine Consultations",
      },
      {
        "@type": "MedicalProcedure",
        name: "Comprehensive Dental Treatments & Orthodontics",
      },
    ],
  };
}

/**
 * Generates WebSite Schema with Sitelinks SearchBox support.
 */
export function generateWebSiteSchema(baseUrl = DEFAULT_BASE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.fullName,
    alternateName: "Sree Aadhityaa",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generates BreadcrumbList Schema for Google search results.
 */
export function generateBreadcrumbSchema(items = [], baseUrl = DEFAULT_BASE_URL) {
  if (!items || items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path ? `${baseUrl}${item.path}` : undefined,
    })),
  };
}

/**
 * Generates Product Schema for Herbal and Siddha medicine products.
 */
export function generateProductSchema(product, baseUrl = DEFAULT_BASE_URL) {
  if (!product) return null;
  const inStock =
    product.inStock !== false &&
    (product.stockQuantity === undefined || Number(product.stockQuantity) > 0);
  const image = product.images?.[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${baseUrl}${product.images[0]}`
    : `${baseUrl}/icons/logo-main.jpeg`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.shortDescription ||
      product.description ||
      `Buy authentic ${product.name} from Sree Aadhityaa Siddha Store.`,
    image: image,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "Sree Aadhityaa",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/shop/product/${product.slug || product.id}`,
      priceCurrency: "INR",
      price: product.price || 0,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "MedicalClinic",
        name: BRAND.fullName,
      },
    },
  };
}

/**
 * Generates MedicalProcedure or MedicalTherapy Schema for clinic treatments.
 */
export function generateServiceSchema(service, practice, baseUrl = DEFAULT_BASE_URL) {
  if (!service) return null;
  const isDental = practice === "dental";
  const type = isDental ? "MedicalProcedure" : "MedicalTherapy";

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: service.name,
    description: service.shortDescription || service.fullDescription,
    image: service.image
      ? service.image.startsWith("http")
        ? service.image
        : `${baseUrl}${service.image}`
      : undefined,
    procedureType: isDental ? "DentalProcedure" : "SiddhaTherapy",
    provider: {
      "@type": isDental ? "Dentist" : "MedicalClinic",
      name: isDental
        ? "Sree Aadhityaa Dental Hospital"
        : "Sree Aadhityaa Siddha Hospital",
      url: `${baseUrl}/${isDental ? "dental" : "siddha"}`,
    },
  };
}

/**
 * Generates Physician Schema for doctor profiles.
 */
export function generateDoctorSchema(doctor, baseUrl = DEFAULT_BASE_URL) {
  if (!doctor) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    jobTitle: doctor.specialty || doctor.title || "Specialist Doctor",
    description: doctor.bio,
    image: doctor.image
      ? doctor.image.startsWith("http")
        ? doctor.image
        : `${baseUrl}${doctor.image}`
      : undefined,
    worksFor: {
      "@type": "MedicalClinic",
      name: BRAND.fullName,
      url: baseUrl,
    },
  };
}

/**
 * Generates FAQPage Schema for interactive search snippet accordions.
 */
export function generateFaqSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q || f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a || f.answer,
      },
    })),
  };
}
