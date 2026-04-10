import React, { useEffect, useState, memo } from "react";
import PropTypes from "prop-types";

const Typewriter = memo(function Typewriter({
                                                words = [],
                                                typingSpeed = 100,
                                                pauseDuration = 1500,
                                            }) {
    const safeWords = Array.isArray(words) ? words : [words];

    const [charIndex, setCharIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [isErasing, setIsErasing] = useState(false);

    const currentWord = safeWords[wordIndex] || "";

    useEffect(() => {
        if (!currentWord) return;

        let timer;

        if (!isErasing) {
            if (charIndex < currentWord.length) {
                timer = setTimeout(() => {
                    setCharIndex((prev) => prev + 1);
                }, typingSpeed);
            } else {
                timer = setTimeout(() => {
                    setIsErasing(true);
                }, pauseDuration);
            }
        } else {
            if (charIndex > 0) {
                timer = setTimeout(() => {
                    setCharIndex((prev) => prev - 1);
                }, typingSpeed / 2);
            } else {
                setIsErasing(false);
                setWordIndex((prev) => (prev + 1) % safeWords.length);
            }
        }

        return () => clearTimeout(timer);
    }, [charIndex, isErasing, currentWord, typingSpeed, pauseDuration, safeWords.length]);

    return (
        <span className="inline-block">
      {currentWord.substring(0, charIndex)}
            <span className="animate-blink ml-1">|</span>
    </span>
    );
});

Typewriter.propTypes = {
    words: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string,
    ]),
    typingSpeed: PropTypes.number,
    pauseDuration: PropTypes.number,
};

export default Typewriter;