export default function Sun() {
  return `<svg
        id="sun"
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
      >
        <g filter="url(#filter0_i_1_4)">
          <circle
            cx="40"
            cy="40"
            r="40"
            transform="matrix(-1 0 0 1 80 0)"
            fill="url(#paint0_radial_1_4)"
          />
        </g>
        <defs>
          <filter
            id="filter0_i_1_4"
            x="0"
            y="0"
            width="80"
            height="84"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology
              radius="50"
              operator="erode"
              in="SourceAlpha"
              result="effect1_innerShadow_1_4"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="9" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.97722 0 0 0 0 0.86772 0 0 0 0 0.0386498 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_1_4"
            />
          </filter>
          <radialGradient
            id="paint0_radial_1_4"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(40 40) rotate(90) scale(40)"
          >
            <stop offset="0.302885" stop-color="white" />
            <stop offset="1" stop-color="#FFD900" stop-opacity="0.37" />
          </radialGradient>
        </defs>
      </svg>`;
}
