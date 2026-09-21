export default function CarteCoteIvoire() {
  return (
    <div className="carteIvoire" aria-hidden="true">
      <svg viewBox="0 0 650 675" role="presentation">
        <image
          className="carteIvoire__image"
          href="/cartes/cote-ivoire.svg"
          width="625"
          height="675"
        />

        <g className="carteIvoire__position" transform="translate(465 560)">
          <circle className="carteIvoire__onde carteIvoire__onde--deux" r="28" />
          <circle className="carteIvoire__onde" r="18" />
          <circle className="carteIvoire__point" r="7" />
          <path className="carteIvoire__trait" d="M10 -7L48 -35" />
          <g className="carteIvoire__etiquette" transform="translate(50 -62)">
            <rect width="112" height="51" rx="2" />
            <text x="12" y="20">ABIDJAN</text>
            <text className="carteIvoire__lieu" x="12" y="38">ANGRÉ · CNPS</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
