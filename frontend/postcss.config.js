function interopDefault(mod) {
  // Some packages are ESM-only and come through `require()` under `default`.
  return mod && typeof mod === "object" && "default" in mod ? mod.default : mod;
}

function getTailwindPostcssPlugin() {
  let major = 0;
  try {
    const version = require("tailwindcss/package.json").version || "0.0.0";
    major = Number.parseInt(String(version).split(".")[0], 10) || 0;
  } catch {
    // If Tailwind isn't installed, defer to the build error; we don't mask it here.
  }

  if (major >= 4) {
    // Tailwind v4 moved the PostCSS plugin into a separate package.
    return interopDefault(require("@tailwindcss/postcss"));
  }

  return interopDefault(require("tailwindcss"));
}

module.exports = {
  plugins: [getTailwindPostcssPlugin(), interopDefault(require("autoprefixer"))],
};
