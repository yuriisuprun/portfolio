import {useId} from "react";
import PropTypes from "prop-types";

export default function CircuitMoonIcon({className = "", size = 18}) {
    const clipId = useId();

    // Standard "moon" shape (Feather-style) for the usual crescent look.
    const moonPath = "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <clipPath id={clipId}>
                    <path d={moonPath}/>
                </clipPath>
            </defs>

            <path
                d={moonPath}
                fill="#fff"
                stroke="#000"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />

            <g
                clipPath={`url(#${clipId})`}
                stroke="#000"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            >
                {/* Minimal traces + nodes to suggest a circuit without clutter. */}
                <path d="M8.3 11.2h6.9"/>
                <path d="M12.9 11.2V9.0h2.3"/>
                <path d="M9.4 14.2h5.3"/>

                <circle cx="8.3" cy="11.2" r="1.0" fill="#000" stroke="none"/>
                <circle cx="15.2" cy="11.2" r="1.0" fill="#000" stroke="none"/>
                <circle cx="15.2" cy="9.0" r="1.0" fill="#000" stroke="none"/>
                <circle cx="9.4" cy="14.2" r="1.0" fill="#000" stroke="none"/>
            </g>
        </svg>
    );
}

CircuitMoonIcon.propTypes = {
    className: PropTypes.string,
    size: PropTypes.number,
};
