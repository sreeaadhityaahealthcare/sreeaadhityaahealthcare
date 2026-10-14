import { BRAND, SITE_URL } from "../../config/site";
import { generateBreadcrumbSchema } from "../../utils/seoSchemas";

const SUFFIX = BRAND.short;
const DEFAULT_BASE_URL = SITE_URL || "https://sreeaadhityaahealthcare.com";

const DEFAULT_KEYWORDS =
  "Sree Aadhityaa, Siddha hospital, dental hospital, Siddha clinic, Dr. M. S. Rajamohan, Siddha medicine Tamil Nadu, dental care, root canal treatment, dental implants, pediatric Siddha, traditional medicine, Gobichettipalayam, Erode, Coimbatore, herbal medicine online store";

/**
 * Production-ready Per-Page SEO Component with OpenGraph, Twitter Cards,
 * Canonical URL, Meta Keywords, and JSON-LD Structured Data Schema.
 */
export default function Seo({
  title,
  description,
  path,
  image = "/og-main.png",
  noindex = false,
  keywords = DEFAULT_KEYWORDS,
  schema = null,
  breadcrumbs = null,
  type = "website",
}) {
  const fullTitle = title ? `${title} | ${SUFFIX}` : `${BRAND.fullName}`;
  const canonicalUrl = path ? `${DEFAULT_BASE_URL}${path}` : undefined;
  const fullImage = image
    ? image.startsWith("http")
      ? image
      : `${DEFAULT_BASE_URL}${image}`
    : `${DEFAULT_BASE_URL}/og-main.png`;

  // Collect schemas into an array
  const schemaList = [];
  if (schema) {
    if (Array.isArray(schema)) {
      schemaList.push(...schema.filter(Boolean));
    } else {
      schemaList.push(schema);
    }
  }

  // Auto-generate breadcrumb schema if breadcrumbs are provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs, DEFAULT_BASE_URL);
    if (breadcrumbSchema) {
      schemaList.push(breadcrumbSchema);
    }
  }

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* OpenGraph / Facebook */}
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={BRAND.fullName} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={fullImage} />

      {/* JSON-LD Structured Data */}
      {schemaList.map((item, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
