/**
 * js/components/icons.js
 *
 * Set de iconos SVG propios, trazo simple (24x24, stroke actual color).
 * Se usan como contenido interno de <svg viewBox="0 0 24 24">...</svg>
 * Mantener este archivo como única fuente de iconos evita duplicar
 * markup SVG en cada componente.
 */

const ICONS = {
  shield: '<path d="M12 3l7 3v6c0 4.6-3 8.2-7 9-4-0.8-7-4.4-7-9V6l7-3z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke-width="1.8"/><path d="M4 7l8 6 8-6" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  "check-square": '<rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="none" stroke-width="1.8"/><path d="M8 12l2.5 2.5L16 9" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  flag: '<path d="M5 21V4" fill="none" stroke-width="1.8" stroke-linecap="round"/><path d="M5 5h11l-2.5 3.5L16 12H5" fill="none" stroke-width="1.8" stroke-linejoin="round"/>',
  "message-circle": '<path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.3-3.6A7.96 7.96 0 0 1 4 12z" fill="none" stroke-width="1.8" stroke-linejoin="round"/>',
  users: '<circle cx="9" cy="8" r="3" fill="none" stroke-width="1.8"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke-width="1.8" stroke-linecap="round"/><path d="M16 4.2a3 3 0 0 1 0 5.8" fill="none" stroke-width="1.8" stroke-linecap="round"/><path d="M15 15.2c2.6.4 4.5 2.1 4.5 4.8" fill="none" stroke-width="1.8" stroke-linecap="round"/>',
  "edit-3": '<path d="M4 20h4L19 9l-4-4L4 16v4z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><path d="M13 7l4 4" fill="none" stroke-width="1.8"/>',
  "user-x": '<circle cx="9" cy="8" r="3.5" fill="none" stroke-width="1.8"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="none" stroke-width="1.8" stroke-linecap="round"/><path d="M17 8l4 4M21 8l-4 4" fill="none" stroke-width="1.8" stroke-linecap="round"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke-width="1.8"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="none" stroke-width="1.8" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4" fill="none" stroke-width="1.8"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8" stroke-width="1.8" stroke-linecap="round"/>',
  arrow: '<path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke-width="1.8" stroke-linecap="round"/>',
  scale: '<path d="M12 3v18M7 21h10" stroke-width="1.8" stroke-linecap="round"/><path d="M5 7l3.5-1.2L12 7M12 7l3.5-1.2L19 7" fill="none" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 7l-2.5 5a3 3 0 0 0 5.5 0L5 7zM19 7l-2.5 5a3 3 0 0 0 5.5 0L19 7z" fill="none" stroke-width="1.8" stroke-linejoin="round"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke-width="1.8"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke-width="1.8" stroke-linecap="round"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 5H5a3 3 0 0 0 3 5M16 5h3a3 3 0 0 1-3 5" fill="none" stroke-width="1.8"/><path d="M10 15h4v3h-4z" fill="none" stroke-width="1.8"/><path d="M8 21h8" stroke-width="1.8" stroke-linecap="round"/>',
  "volume-x": '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 9l4 6M20 9l-4 6" stroke-width="1.8" stroke-linecap="round"/>',
  "volume-on": '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke-width="1.8" stroke-linecap="round"/>',
  settings: '<circle cx="12" cy="12" r="3.2" fill="none" stroke-width="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke-width="1.8" stroke-linejoin="round"/>',
  user: '<circle cx="12" cy="8" r="3.6" fill="none" stroke-width="1.8"/><path d="M4.5 20c.6-3.6 3.6-5.6 7.5-5.6s6.9 2 7.5 5.6" fill="none" stroke-width="1.8" stroke-linecap="round"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-.8-.5-1.3-.5-2.1 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.7 17 3 12 3z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10" cy="7.2" r="1.1"/><circle cx="14.5" cy="7.2" r="1.1"/>',
  globe: '<circle cx="12" cy="12" r="9" fill="none" stroke-width="1.8"/><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z" fill="none" stroke-width="1.8" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="9" fill="none" stroke-width="1.8"/><path d="M12 7v5l3.2 2" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  info: '<circle cx="12" cy="12" r="9" fill="none" stroke-width="1.8"/><path d="M12 11v5.2" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.8" r="1.1"/>',
  chevron: '<path d="M6 9l6 6 6-6" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.2" fill="none" stroke-width="1.8"/><path d="M15.5 8.5V6.7a2.2 2.2 0 0 0-2.2-2.2H6.7a2.2 2.2 0 0 0-2.2 2.2v6.6a2.2 2.2 0 0 0 2.2 2.2h1.8" fill="none" stroke-width="1.8"/>',
  github: '<path stroke="none" fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  discord: '<path stroke="none" fill="currentColor" d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>'
};

function svgIcon(name) {
  return ICONS[name] || ICONS.shield;
}
