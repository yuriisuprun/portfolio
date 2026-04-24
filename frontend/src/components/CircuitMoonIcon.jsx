import PropTypes from "prop-types";

export default function CircuitMoonIcon({className = "", size = 18}) {
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
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

CircuitMoonIcon.propTypes = {
    className: PropTypes.string,
    size: PropTypes.number,
};
