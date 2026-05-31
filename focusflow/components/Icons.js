const ArrowUpRight = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const PlayIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <polygon points="6,4 20,12 6,20" />
  </svg>
);

window.ArrowUpRight = ArrowUpRight;
window.PlayIcon = PlayIcon;
