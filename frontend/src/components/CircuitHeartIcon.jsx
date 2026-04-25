import PropTypes from "prop-types";

export default function CircuitHeartIcon({className = "", size = 14}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24"
            className={className} role="img" aria-label="heart">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                2 6 3.2 4 5.2 3.1 7 2.3 9.1 2.7 10.6 4.2
                L12 5.6l1.4-1.4c1.5-1.5 3.6-1.9 5.4-1.1
                2 .9 3.2 2.9 3.2 5.4 0 3.8-3.4 6.9-8.6 11.6L12 21.35z"
                fill="#fff"
                stroke="#000"
                strokeWidth="1"/></svg>);
}

CircuitHeartIcon.propTypes = {
    className: PropTypes.string,
    size: PropTypes.number,
};
