"use client";

import { APP_NAME, APP_URL } from "@/lib/constants";

const MESSAGE = `Training with ${APP_NAME} - log workouts, measurements and progress in the browser: ${APP_URL}`;

/**
 * Floating WhatsApp button (protocol): official WhatsApp mark on brand
 * green, with a tooltip above the button. Opens WhatsApp's share sheet
 * with the app link, so no phone number has to be published.
 */
export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share Aero Gym on WhatsApp"
      className="group fixed bottom-24 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 focus-visible:scale-105 lg:bottom-8 lg:left-[17rem]"
    >
      <span className="pointer-events-none absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-lg border border-card-border bg-card px-2 py-1 text-[10px] font-semibold text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        Share on WhatsApp
      </span>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#ffffff" aria-hidden="true">
        <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.445h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411zM12.05 21.785h-.005a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885zm5.421-7.403c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
    </a>
  );
}
