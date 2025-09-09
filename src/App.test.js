import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Login heading', () => {
  render(<App />);
  const heading = screen.getByText(/Login/i);
  expect(heading).toBeInTheDocument();
});
