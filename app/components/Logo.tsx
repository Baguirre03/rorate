export default function Logo({
  className = "w-5 h-5",
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      {/* Background circle - adapts to theme with better visibility */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="currentColor"
        style={{ opacity: 0.15 }}
      />
      {/* Trending up arrow/chart - uses currentColor to adapt to theme */}
      <path
        d="M8 20 L12 16 L16 18 L24 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 10 L24 10 L24 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
