type WheatCornerProps = {
  bottom?: string | number;
  right?: string | number;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  opacity?: number;
  zIndex?: number;
};

export default function WheatCorner({
  bottom = '-70px',
  right = '-55px',
  top,
  left,
  width = 'min(52vw, 560px)',
  opacity = 0.52,
  zIndex = 0,
}: WheatCornerProps) {
  return (
    <svg
      aria-hidden="true"
      className="hero-wheat-corner wheat-corner-art"
      viewBox="0 0 560 620"
      style={{
        position: 'fixed',
        bottom,
        right,
        top,
        left,
        width,
        height: width,
        zIndex,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="wheatGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff1ba" />
          <stop offset="48%" stopColor="#f4d88c" />
          <stop offset="100%" stopColor="#d3a85b" />
        </linearGradient>
        <linearGradient id="stalkGreen" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5e9c55" />
          <stop offset="55%" stopColor="#a9d477" />
          <stop offset="100%" stopColor="#d7efaa" />
        </linearGradient>
        <linearGradient id="stalkGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b88943" />
          <stop offset="60%" stopColor="#e2bd70" />
          <stop offset="100%" stopColor="#f8e1a2" />
        </linearGradient>
        <filter id="wheatSoftness" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <g filter="url(#wheatSoftness)">
        <path d="M68 620 C58 500, 78 366, 152 226 C132 362, 131 500, 151 620 Z" fill="url(#stalkGreen)" opacity="0.8" />
        <path d="M125 620 C110 484, 143 340, 230 188 C197 358, 193 498, 215 620 Z" fill="url(#stalkGreen)" opacity="0.72" />
        <path d="M184 620 C169 475, 207 307, 310 120 C270 337, 268 501, 288 620 Z" fill="url(#stalkGreen)" opacity="0.64" />
        <path d="M245 620 C235 495, 284 367, 380 238 C341 388, 337 510, 359 620 Z" fill="url(#stalkGreen)" opacity="0.5" />

        <g fill="none" stroke="url(#stalkGold)" strokeLinecap="round">
          <path d="M220 620 C211 462, 216 296, 280 85" strokeWidth="5" />
          <path d="M322 620 C302 460, 331 270, 410 42" strokeWidth="5" />
          <path d="M426 620 C408 496, 440 378, 505 225" strokeWidth="4" />
        </g>

        <g fill="url(#wheatGold)">
          <g transform="translate(280 85)">
            <ellipse cx="0" cy="0" rx="18" ry="32" transform="rotate(-12)" />
            <ellipse cx="-28" cy="36" rx="16" ry="29" transform="rotate(-38)" />
            <ellipse cx="28" cy="42" rx="16" ry="29" transform="rotate(32)" />
            <ellipse cx="-31" cy="76" rx="15" ry="28" transform="rotate(-38)" />
            <ellipse cx="29" cy="82" rx="15" ry="28" transform="rotate(32)" />
            <ellipse cx="-29" cy="116" rx="14" ry="26" transform="rotate(-36)" />
            <ellipse cx="26" cy="122" rx="14" ry="26" transform="rotate(30)" />
            <ellipse cx="-23" cy="155" rx="13" ry="24" transform="rotate(-30)" />
          </g>
          <g transform="translate(410 42) scale(0.95)">
            <ellipse cx="0" cy="0" rx="18" ry="32" transform="rotate(-10)" />
            <ellipse cx="-27" cy="35" rx="16" ry="29" transform="rotate(-38)" />
            <ellipse cx="28" cy="42" rx="16" ry="29" transform="rotate(32)" />
            <ellipse cx="-30" cy="75" rx="15" ry="27" transform="rotate(-35)" />
            <ellipse cx="27" cy="82" rx="15" ry="27" transform="rotate(30)" />
            <ellipse cx="-26" cy="114" rx="14" ry="25" transform="rotate(-32)" />
            <ellipse cx="25" cy="120" rx="14" ry="25" transform="rotate(28)" />
            <ellipse cx="-20" cy="151" rx="13" ry="23" transform="rotate(-28)" />
          </g>
          <g transform="translate(505 225) scale(0.7)">
            <ellipse cx="0" cy="0" rx="17" ry="30" transform="rotate(-8)" />
            <ellipse cx="-25" cy="32" rx="15" ry="27" transform="rotate(-34)" />
            <ellipse cx="26" cy="38" rx="15" ry="27" transform="rotate(30)" />
            <ellipse cx="-24" cy="70" rx="14" ry="25" transform="rotate(-32)" />
            <ellipse cx="24" cy="76" rx="14" ry="25" transform="rotate(28)" />
          </g>
        </g>
      </g>
    </svg>
  );
}