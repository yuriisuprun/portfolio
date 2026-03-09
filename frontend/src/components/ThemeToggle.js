export default function ThemeToggle({ dark, setDark }) {

    function toggle() {
        setDark(!dark);
    }

    return (
        <button onClick={toggle}>
            {dark ? "☀️" : "🌙"}
        </button>
    );
}