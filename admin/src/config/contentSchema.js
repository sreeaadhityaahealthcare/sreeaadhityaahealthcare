// Structured content model for the public website (siteContent/{main|ayurveda|dental}).
// The editor renders forms from this schema. Defaults mirror the public site's defaults.

const ICON_OPTIONS = [
  { value: 'stethoscope', label: 'Stethoscope' },
  { value: 'heart', label: 'Care' },
  { value: 'building', label: 'Facilities' },
  { value: 'user', label: 'Personal' },
  { value: 'shield', label: 'Trust' },
];

const contactFields = [
  { key: 'phone', label: 'Phone', type: 'phone', hint: 'Leave empty to use the group-wide number from Settings.' },
  { key: 'whatsapp', label: 'WhatsApp number', type: 'phone' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'address', label: 'Address', type: 'textarea', max: 300 },
  { key: 'workingHours', label: 'Working hours', type: 'textarea', max: 200 },
  { key: 'mapUrl', label: 'Google Maps embed URL', type: 'url', hint: 'In Google Maps: Share → Embed a map → copy the src="…" link.' },
];

export const CONTENT_SCHEMA = {
  main: [
    {
      id: 'hero',
      title: 'Home Hero Banner & Slides',
      description: 'Controls the main brand headline, intro text, and hero backdrop image on the homepage.',
      badge: 'Displays on: Homepage Hero',
      icon: 'sparkles',
      previewUrl: '/',
      path: 'hero',
      fields: [
        { key: 'eyebrow', label: 'Small heading / Eyebrow badge', max: 60 },
        { key: 'title', label: 'Headline', max: 140, required: true },
        { key: 'subtitle', label: 'Sub-heading / Description', type: 'textarea', max: 300 },
        { key: 'image', label: 'Hero image (optional)', type: 'image' },
      ],
    },
    {
      id: 'practices',
      title: 'Hospitals & Practices Overview',
      description: 'Text and highlight bullets for the Siddha and Dental hospital selector cards on the homepage.',
      badge: 'Displays on: Homepage Practice Selector',
      icon: 'building',
      previewUrl: '/#practices',
      path: 'practicesOverview',
      fields: [
        { key: 'eyebrow', label: 'Section eyebrow', max: 60 },
        { key: 'title', label: 'Section title', max: 100, required: true },
        { key: 'subtitle', label: 'Section description', type: 'textarea', max: 250 },
        { key: 'siddhaTagline', label: 'Siddha hospital tagline', max: 120 },
        { key: 'siddhaPoints', label: 'Siddha highlight points (one per line)', type: 'textarea', max: 500, rows: 3 },
        { key: 'dentalTagline', label: 'Dental hospital tagline', max: 120 },
        { key: 'dentalPoints', label: 'Dental highlight points (one per line)', type: 'textarea', max: 500, rows: 3 },
      ],
    },

    {
      id: 'herbal-showcase',
      title: 'Physician Herbal & Cosmetic Products Showcase',
      description: 'Header text for the featured physician herbal formulations showcase.',
      badge: 'Displays on: Homepage Store Showcase',
      icon: 'leaf',
      previewUrl: '/',
      path: 'herbalShowcase',
      fields: [
        { key: 'eyebrow', label: 'Section eyebrow', max: 60 },
        { key: 'title', label: 'Section headline', max: 100, required: true },
        { key: 'description', label: 'Section description', type: 'textarea', max: 300 },
      ],
    },
    {
      id: 'why-choose',
      title: 'Why Choose Us (Benefit Cards)',
      description: 'Key healthcare commitments displayed across the homepage and about page.',
      badge: 'Displays on: Homepage & /about',
      icon: 'shield',
      previewUrl: '/',
      path: 'whyChoose',
      type: 'list',
      max: 8,
      itemLabel: 'Card',
      fields: [
        { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
        { key: 'title', label: 'Title', max: 60, required: true },
        { key: 'text', label: 'Text', type: 'textarea', max: 200 },
      ],
    },
    {
      id: 'appointment-cta',
      title: 'Appointment Call-To-Action Banner',
      description: 'Full-width booking banner placed before the footer.',
      badge: 'Displays on: Homepage Pre-Footer',
      icon: 'calendar',
      previewUrl: '/',
      path: 'appointmentCta',
      fields: [
        { key: 'title', label: 'Headline', max: 100, required: true },
        { key: 'text', label: 'Sub-heading / Instructions', type: 'textarea', max: 250 },
      ],
    },
    {
      id: 'about-page',
      title: 'About SREE AADHITYAA Page Content',
      description: 'The story and mission presented on the dedicated /about page.',
      badge: 'Displays on: /about',
      icon: 'book',
      previewUrl: '/about',
      path: 'about',
      fields: [
        { key: 'title', label: 'Headline', max: 100, required: true },
        { key: 'body', label: 'Detailed hospital story', type: 'textarea', max: 4000, rows: 8 },
      ],
    },
  ],
  ayurveda: [
    {
      id: 'siddha-hero',
      title: 'Siddha Hospital Hero Banner',
      description: 'Hero headline, subtitle, and primary image for the Siddha hospital page.',
      badge: 'Displays on: /siddha Hero',
      icon: 'sparkles',
      previewUrl: '/siddha',
      path: 'hero',
      fields: [
        { key: 'title', label: 'Headline', max: 140, required: true },
        { key: 'subtitle', label: 'Sub-heading', type: 'textarea', max: 300 },
        { key: 'image', label: 'Hero image (optional)', type: 'image' },
      ],
    },
    {
      id: 'siddha-about',
      title: 'About the Siddha Hospital',
      description: 'Story, traditional philosophy, and clinical practice description for the Siddha hospital.',
      badge: 'Displays on: /siddha About Section',
      icon: 'book',
      previewUrl: '/siddha#about',
      path: 'about',
      fields: [
        { key: 'title', label: 'Title', max: 120, required: true },
        { key: 'body', label: 'Body text', type: 'textarea', max: 4000, rows: 8 },
        { key: 'image', label: 'Image (optional)', type: 'image' },
      ],
    },
    {
      id: 'siddha-contact',
      title: 'Siddha Hospital Contact & Clinic Details',
      description: 'Overrides for this practice only. Empty fields use the group-wide details from Settings.',
      badge: 'Displays on: /siddha Contact Section',
      icon: 'phone',
      previewUrl: '/siddha#contact',
      path: 'contact',
      fields: contactFields,
    },
  ],
  dental: [
    {
      id: 'dental-hero',
      title: 'Dental Hospital Hero Banner',
      description: 'Hero headline, subtitle, and primary image for the Dental hospital page.',
      badge: 'Displays on: /dental Hero',
      icon: 'sparkles',
      previewUrl: '/dental',
      path: 'hero',
      fields: [
        { key: 'title', label: 'Headline', max: 140, required: true },
        { key: 'subtitle', label: 'Sub-heading', type: 'textarea', max: 300 },
        { key: 'image', label: 'Hero image (optional)', type: 'image' },
      ],
    },
    {
      id: 'dental-about',
      title: 'About the Dental Hospital',
      description: 'Story, comfort philosophy, and clinical standards description for the Dental hospital.',
      badge: 'Displays on: /dental About Section',
      icon: 'book',
      previewUrl: '/dental#about',
      path: 'about',
      fields: [
        { key: 'title', label: 'Title', max: 120, required: true },
        { key: 'body', label: 'Body text', type: 'textarea', max: 4000, rows: 8 },
        { key: 'image', label: 'Image (optional)', type: 'image' },
      ],
    },
    {
      id: 'dental-facilities',
      title: 'Dental Clinical Facilities',
      description: 'Infrastructure and clinical care suites showcased on the dental hospital page.',
      badge: 'Displays on: /dental Facilities Grid',
      icon: 'building',
      previewUrl: '/dental#facilities',
      path: 'facilities',
      type: 'list',
      max: 8,
      itemLabel: 'Facility',
      fields: [
        { key: 'title', label: 'Title', max: 60, required: true },
        { key: 'text', label: 'Text', type: 'textarea', max: 200 },
        { key: 'image', label: 'Image (optional)', type: 'image' },
      ],
    },
    {
      id: 'dental-contact',
      title: 'Dental Hospital Contact & Clinic Details',
      description: 'Overrides for this practice only. Empty fields use the group-wide details from Settings.',
      badge: 'Displays on: /dental Contact Section',
      icon: 'phone',
      previewUrl: '/dental#contact',
      path: 'contact',
      fields: contactFields,
    },
  ],
};

export const CONTENT_DEFAULTS = {
  main: {
    hero: {
      eyebrow: 'Siddha & Dental Healthcare',
      title: 'SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE',
      subtitle: 'Integrated Siddha and Dental care under one trusted roof, with online appointments and authentic herbal wellness products.',
      image: '/home-hero.png',
    },
    practicesOverview: {
      eyebrow: 'Our practices',
      title: 'Choose the care you need',
      subtitle: 'Two hospitals with their own doctors, treatments and appointment booking.',
      siddhaTagline: 'Traditional Siddha care, personalised for you',
      siddhaPoints: 'Led by Dr. M. S. Rajamohan, MD (Siddha) NIS\nSpecialized pediatric, spine, joint & gastrointestinal care\nTraditional herbal & cosmetic products online',
      dentalTagline: 'Modern, comfortable dental care for the whole family',
      dentalPoints: 'Check-ups and preventive care\nRestorative and cosmetic treatments\nCare for children and adults',
    },


    herbalShowcase: {
      eyebrow: 'Physician Formulations',
      title: 'Herbal & Cosmetic Products',
      description: 'Formulated under Siddha guidance with genuine botanicals for daily skin glow, pimple care, hair strength, and oral health.',
    },
    whyChoose: [
      { icon: 'stethoscope', title: 'Experienced care', text: 'Consultations led by qualified practitioners in each discipline.' },
      { icon: 'heart', title: 'Patient-focused', text: 'Time to listen, explain options and plan care around you.' },
      { icon: 'building', title: 'Modern facilities', text: 'Clean, comfortable clinical spaces for every visit.' },
      { icon: 'user', title: 'Personalised consultation', text: 'Recommendations tailored to your needs and history.' },
    ],
    appointmentCta: {
      title: 'Book your appointment online',
      text: 'Choose a practice, doctor and preferred time. Our team will confirm your request.',
    },
    about: {
      title: 'About SREE AADHITYAA',
      body: 'Sree Aadhityaa Integrated Siddha and Dental Healthcare brings together authentic traditional healing systems and modern dental sciences. Our experienced physicians and surgeons provide compassionate, individualized care designed for total wellness.',
    },
  },
  ayurveda: {
    hero: {
      title: 'Shree Aadhitya Siddha Hospital',
      subtitle: 'Consultations and classical therapies guided by experienced Siddha physicians, tailored to your holistic health.',
      image: '/icons/logo-siddha.jpeg',
    },
    about: {
      title: 'Authentic, Personalised Traditional Healing',
      body: 'Our Siddha hospital combines time-tested therapies, genuine herbal medicines, and personalized dietary guidance in a calm, modern clinical setting.',
      image: '/ayurveda-about.png',
    },
    contact: { phone: '', whatsapp: '', email: '', address: '', workingHours: '', mapUrl: '' },
  },
  dental: {
    hero: {
      title: 'Shree Aadhitya Dental Hospital',
      subtitle: 'Preventive, restorative, aesthetic, and surgical dental care in a pristine, comfortable, and modern clinical environment.',
      image: '/icons/logo-dental.jpeg',
    },
    about: {
      title: 'Comprehensive Dental Care That Puts You at Ease',
      body: 'Our modern dental hospital offers comprehensive dental treatments for children and adults. We prioritize patient comfort, strict hygiene protocols, and long-lasting dental health.',
      image: '/dental-about.png',
    },
    facilities: [
      {
        title: 'Modern equipment',
        text: 'Up-to-date dental equipment designed for precision, patient comfort and efficient treatment.',
        image: '/fac-dental-equipment.png',
      },
      {
        title: 'Sterilisation & hygiene',
        text: 'Rigorous multi-step sterilisation and hygiene protocols ensuring a clean, safe clinical environment.',
        image: '/fac-dental-sterilisation.png',
      },
      {
        title: 'Comfortable treatment rooms',
        text: 'Calm, private spaces equipped to help you feel relaxed and completely at ease during every procedure.',
        image: '/fac-dental-rooms.png',
      },
    ],
    contact: { phone: '', whatsapp: '', email: '', address: '', workingHours: '', mapUrl: '' },
  },
};
