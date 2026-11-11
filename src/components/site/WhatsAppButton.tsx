import { contact } from "@/lib/site";

/**
 * Floating WhatsApp chat button, bottom-right on every public page.
 *
 * Restaurant owners reply on WhatsApp far more readily than they fill forms,
 * so this is the lowest-friction way in from a paid click. The click is
 * tracked by the delegated listener in MetaPixel (Meta Contact + Google Ads
 * "whatsapp" conversion), so this component needs no client JS of its own.
 */
const PREFILL = encodeURIComponent(
  "Hi Plateful, I'd like to grow my restaurant's Swiggy/Zomato sales. Restaurant name & city: ",
);

export function WhatsAppButton() {
  return (
    <a
      href={`${contact.whatsapp}?text=${PREFILL}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Plateful Consulting on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 md:bottom-7 md:right-7 md:px-5"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43zm8.03-17.47A11.3 11.3 0 0 0 12.05.7C5.79.7.7 5.79.7 12.04c0 2 .52 3.95 1.52 5.67L.6 23.3l5.73-1.5a11.32 11.32 0 0 0 5.71 1.46h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.31-8.02z" />
      </svg>
      <span className="hidden text-sm font-semibold md:inline">WhatsApp us</span>
    </a>
  );
}
