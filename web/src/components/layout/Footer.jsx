import { Link } from "react-router-dom";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { useSite } from "../../contexts/SiteContext";
import { telHref } from "../../utils/contact";
import Logo from "./Logo";

const Col = ({ title, children }) => (
  <div>
    <h2 className="mb-4 font-sans text-sm font-semibold tracking-wide text-white uppercase">
      {title}
    </h2>
    <ul className="space-y-2.5 text-sm text-white/70">{children}</ul>
  </div>
);
const L = ({ to, children }) => (
  <li>
    <Link to={to} className="hover:text-white hover:underline">
      {children}
    </Link>
  </li>
);

export default function Footer() {
  const { settings, contactFor } = useSite();
  const c = contactFor();
  const social = Object.entries(settings.social || {}).filter(([, url]) => url);
  const mapEmbedUrl =
    c.mapUrl ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1920.3434634993496!2d77.24737390410193!3d11.506699337689767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba921000e590461%3A0xab17af8357a938c1!2sSree%20Aadithya%20Siddha%20Medical%20and%20Dental%20Care%20Centre!5e0!3m2!1sen!2sin!4v1791982499148!5m2!1sen!2sin";

  return (
    <footer className="bg-ink-900 text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-3">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Integrated Siddha and dental healthcare, with online appointments
            and an online store.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-white/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{c.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <a href={telHref(c.phone)} className="hover:underline hover:text-white">
                {c.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <a
                href={`mailto:${c.email}`}
                className="break-all hover:underline hover:text-white"
              >
                {c.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <Col title="Explore">
            <L to="/">Home</L>
            <L to="/doctors">Our doctors</L>
            <L to="/appointments">Book appointment</L>
            <L to="/about">About us</L>
            <L to="/contact">Contact</L>
          </Col>
        </div>

        <div className="lg:col-span-2">
          <Col title="Practices">
            <L to="/siddha">Siddha Hospital</L>
            <L to="/siddha/services">Siddha treatments</L>
            <L to="/dental">Dental Hospital</L>
            <L to="/dental/services">Dental treatments</L>
          </Col>
        </div>

        <div className="lg:col-span-2">
          <Col title="Shop & legal">
            <L to="/shop">Siddha & Herbal store</L>
            <L to="/cart">Cart</L>
            <L to="/order-status">Check Order Status</L>
            <L to="/privacy-policy">Privacy policy</L>
            <L to="/terms">Terms &amp; conditions</L>
          </Col>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <h2 className="mb-4 font-sans text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2">
            <MapPin className="size-4 text-emerald-400" aria-hidden="true" />
            Clinic Location
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-md aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3]">
            <iframe
              src={mapEmbedUrl}
              title="Sree Aadithya Siddha Medical and Dental Care Centre Location"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <a
            href="https://maps.google.com/?q=Sree+Aadithya+Siddha+Medical+and+Dental+Care+Centre"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
          >
            <MapPin className="size-3.5" aria-hidden="true" /> View on Google Maps
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl">{settings.disclaimer}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
            {social.map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 capitalize hover:text-white"
              >
                <Globe className="size-3.5" aria-hidden="true" /> {name}
              </a>
            ))}
          </div>
        </div>
        <div className="container-page pb-6 text-xs text-white/50">
          © {new Date().getFullYear()} {settings.brand.groupName}. Website by{" "}
          {settings.brand.developer}.
        </div>
      </div>
    </footer>
  );
}
