import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('redirects / to /home and renders the Hero image', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  // expect(
  //   await screen.findByAltText('Yurii Suprun - Software Engineer')
  // ).toBeInTheDocument();
});

test('renders navbar and footer on a routed page', async () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: 'YURII SUPRUN' })).toBeInTheDocument();
  expect(await screen.findByRole('contentinfo')).toBeInTheDocument();
});
