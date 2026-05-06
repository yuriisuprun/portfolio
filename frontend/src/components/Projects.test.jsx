import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';
import Projects from './Projects';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('shows loading state then renders filtered repos in configured order', async () => {
  axios.get.mockResolvedValueOnce({
    data: [
      { id: 1, name: 'AI-language-tutoring-system', html_url: 'https://example.com/AI-language-tutoring-system' },
      { id: 2, name: 'portfolio', html_url: 'https://example.com/portfolio' },
      { id: 3, name: 'other-repo', html_url: 'https://example.com/other-repo' },
      {id: 4, name: 'monolith-to-microservices', html_url: 'https://example.com/monolith-to-microservices',},
      { id: 5, name: 'memora-mcp', html_url: 'https://example.com/memora-mcp' },
      { id: 6, name: 'library-system', html_url: 'https://example.com/library-system' },
    ],
  });

  render(<Projects language="en" />);

  // While fetching, the component shows a helpful note + skeleton cards.
  expect(
    screen.getByText(/Waking up the server/i)
  ).toBeInTheDocument();

  // Wait for the first repo to render.
  expect(await screen.findByText('memora-mcp')).toBeInTheDocument();

  // Disallowed repos are filtered out.
  expect(screen.queryByText('other-repo')).not.toBeInTheDocument();

  // Ensure the ordering matches the allow-list ordering.
  const repoHeadings = screen.getAllByRole('heading', { level: 3 });
  expect(repoHeadings.map((h) => h.textContent)).toEqual([
    'AI-language-tutoring-system',
    'memora-mcp',
    'portfolio',
    'monolith-to-microservices',
    'library-system',
  ]);

  // Loading info should go away once finished.
  await waitFor(() =>
    expect(screen.queryByText(/Waking up the server/i)).not.toBeInTheDocument()
  );
});

test('shows an error message on API failure', async () => {
  axios.get.mockRejectedValueOnce(new Error('network'));

  render(<Projects language="en" />);

  expect(await screen.findByText(/Failed to load repositories/i)).toBeInTheDocument();
});
