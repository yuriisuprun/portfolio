import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Navbar from './Navbar';

test('toggles the mobile menu button aria-expanded', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <Navbar dark={false}
        setDark={vi.fn()}
        language="en"
        setLanguage={vi.fn()}/>
    </MemoryRouter>
  );

  const button = screen.getByRole('button', { name: 'Toggle menu' });
  expect(button).toHaveAttribute('aria-expanded', 'false');

  await user.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
});

test('invokes language toggle callback', async () => {
  const user = userEvent.setup();
  const setLanguage = vi.fn();

  render(
    <MemoryRouter>
      <Navbar dark={false}
        setDark={vi.fn()}
        language="en"
        setLanguage={setLanguage}/>
    </MemoryRouter>
  );

  await user.click(screen.getByRole('button', { name: 'Switch to Italian' }));
  expect(setLanguage).toHaveBeenCalledWith('it');
});
