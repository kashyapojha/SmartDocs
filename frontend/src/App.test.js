import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SmartDocs brand in navbar', () => {
  render(<App />);
  const brandElement = screen.getByText(/SmartDocs/i);
  expect(brandElement).toBeInTheDocument();
});
