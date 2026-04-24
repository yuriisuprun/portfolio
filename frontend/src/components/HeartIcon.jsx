import PropTypes from "prop-types";

export default function HeartIcon({ className = "", size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 21s-7.2-4.7-9.4-8.6C.9 9.4 2.2 6 5.4 5c2-.6 3.8.2 4.9 1.5L12 8.2l1.7-1.7c1.1-1.3 2.9-2.1 4.9-1.5 3.2 1 4.5 4.4 2.8 7.4C19.2 16.3 12 21 12 21z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

HeartIcon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

