// Mandi Setu crop icons - Lucide-compatible (24x24, stroke-based)
// Usage: <Onion size={20} color="currentColor" strokeWidth={2} />
import React from "react";

export const Onion = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 8c2.8 1.8 4 4.4 4 7a4 4 0 0 1-8 0c0-2.6 1.2-5.2 4-7z" />
    <path d="M8.8 12.5c1.7 1 4.7 1 6.4 0" />
    <path d="M12 8c-.3-1.4.6-1.9.1-3.2" />
    <path d="M12 8c.3-1-.3-1.6.4-2.6" />
  </svg>
);

export const Wheat2 = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 21V3" />
    <path d="M12 6l2.5-1.8M12 6l-2.5-1.8" />
    <path d="M12 9.5l2.5-1.8M12 9.5l-2.5-1.8" />
    <path d="M12 13l2.5-1.8M12 13l-2.5-1.8" />
  </svg>
);

export const Potato = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.6 13c-.7-3.2 1.3-6.4 4.8-7.4c2.1-.6 3.9.1 5.7 1c2.6 1.3 5.1 2.6 5.2 5.7c.1 3.3-2.4 6.1-6.2 7.1c-3.6 1-7.3-.2-8.7-3c-.5-1-.8-2.2-.8-3.4z" />
    <circle cx="9" cy="10.6" r=".6" fill={color} stroke="none" />
    <circle cx="14" cy="14" r=".6" fill={color} stroke="none" />
  </svg>
);

export const Tomato = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="13.3" r="7.3" />
    <path d="M12 6V4.6" />
    <path d="M12 6c-1.2-1.6-2.6-2-3.6-1.6" />
    <path d="M12 6c1.2-1.6 2.6-2 3.6-1.6" />
  </svg>
);

export const Soybean = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 5c-2.3 1.8-3.5 4.8-3.2 7.8c.4 3.7 3 6.8 6.8 7.7c3.1.7 5.7-.5 6.6-3c1-2.8.1-6.2-2.3-8.7c-2.1-2.2-5-3.7-7.9-3.8z" />
    <path d="M9.2 9c.9.5.9 1.6 0 2.1" />
    <path d="M11.6 12.2c.9.5.9 1.6 0 2.1" />
    <path d="M14 15.4c.9.4.8 1.4 0 1.9" />
  </svg>
);