// Escudo CVO redibujado a mano en vector. Los <defs> se pintan UNA sola vez
// (ver <CrestDefs/> en App.jsx) y se reutilizan en cualquier punto del sitio
// con <Crest className="..."/>, que solo hace <svg><use href="#cvo-crest"/></svg>.
// Va incrustado (no <img src>) para que escale sin pixelarse.

export function CrestDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <path
          id="cvo-ring"
          fill="none"
          d="M 256 256 m -182 0 a 182 182 0 1 1 364 0 a 182 182 0 1 1 -364 0"
        />
        <clipPath id="cvo-disc">
          <circle cx="256" cy="256" r="167" />
        </clipPath>
        <radialGradient id="cvo-ball" cx="34%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e2e7ec" />
          <stop offset="100%" stopColor="#a8b1b9" />
        </radialGradient>
        <g id="cvo-balon">
          <circle r="18" fill="url(#cvo-ball)" stroke="#111111" strokeWidth="2" />
          <g fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round">
            <path d="M -6.5 -16.8 A 26 26 0 0 0 -11.5 13.9" />
            <path d="M 2 -17.9 A 26 26 0 0 0 -2 17.9" />
            <path d="M 10.5 -14.6 A 26 26 0 0 0 8.5 15.9" />
            <path d="M -17.9 -2 A 26 26 0 0 0 -9 15.6" />
            <path d="M -17.4 4.6 A 20 20 0 0 0 -4 17.5" />
          </g>
        </g>

        <symbol id="cvo-crest" viewBox="0 0 512 512">
          <title>Club Voleibol Oviedo</title>
          <circle cx="256" cy="256" r="234" fill="#ffffff" />
          <circle cx="256" cy="256" r="231" fill="none" stroke="#111111" strokeWidth="5" />
          <circle cx="256" cy="256" r="201" fill="none" stroke="#FFE800" strokeWidth="55" />
          <circle cx="256" cy="256" r="171" fill="none" stroke="#111111" strokeWidth="5" />
          <circle cx="256" cy="256" r="167" fill="#00DCF5" />
          <g clipPath="url(#cvo-disc)">
            <polygon points="196,150 316,150 366,368 146,368" fill="#FF7A21" />
            <g fill="#ffffff">
              <polygon points="212,186 300,186 303,193 209,193" />
              <polygon points="224,240 288,240 294,249 218,249" />
              <polygon points="212,292 300,292 309,302 203,302" />
              <polygon points="199,346 313,346 324,357 188,357" />
            </g>
            <g>
              <rect x="150" y="172" width="212" height="28" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
              <rect x="143" y="160" width="14" height="52" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
              <rect x="355" y="160" width="14" height="52" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
            </g>
          </g>
          <g clipPath="url(#cvo-disc)">
            <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 192.5 153.3 A 34 129 0 1 0 192.5 364.7" strokeWidth="20" />
              <ellipse cx="360" cy="257" rx="23" ry="129" strokeWidth="19" />
            </g>
            <path
              d="M198,89 H252 V103 H240 L262,388 L293,103 H281 V89 H320 V103 H309 L274,418 H256 L206,103 H198 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <g fill="none" stroke="#111111" strokeLinecap="round">
              <path d="M 192.5 153.3 A 34 129 0 1 0 192.5 364.7" strokeWidth="13" />
              <ellipse cx="360" cy="257" rx="23" ry="129" strokeWidth="12" />
            </g>
            <path
              d="M198,89 H252 V103 H240 L262,388 L293,103 H281 V89 H320 V103 H309 L274,418 H256 L206,103 H198 Z"
              fill="#111111"
            />
          </g>
          <use href="#cvo-balon" x="70.6" y="173.4" />
          <use href="#cvo-balon" x="441.4" y="173.4" />
          <use href="#cvo-balon" x="256" y="459" />
          <g
            fill="#111111"
            fontFamily="'Bitter','Roboto Slab',Georgia,'Times New Roman',serif"
            fontWeight="700"
            fontSize="46"
            letterSpacing="14"
          >
            <text>
              <textPath href="#cvo-ring" startOffset="25%" textAnchor="middle">VOLEIBOL</textPath>
            </text>
            <text>
              <textPath href="#cvo-ring" startOffset="59.2%" textAnchor="middle">OVIEDO</textPath>
            </text>
            <text>
              <textPath href="#cvo-ring" startOffset="90.8%" textAnchor="middle">CLUB</textPath>
            </text>
          </g>
        </symbol>
      </defs>
    </svg>
  )
}

export default function Crest({ className }) {
  return (
    <svg className={className} role="img" aria-label="Club Voleibol Oviedo">
      <use href="#cvo-crest" />
    </svg>
  )
}
