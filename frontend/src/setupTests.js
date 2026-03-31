// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  // Isolate tests that read/write localStorage (e.g. useDarkMode/useLanguage).
  localStorage.clear();
  document.documentElement.className = '';

  // Some components (SEO) mutate <head>. Keep tests hermetic.
  document.head
    .querySelectorAll(
      "meta[name='description'], meta[name='keywords'], link[rel='canonical']"
    )
    .forEach((node) => node.remove());
});
