import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const repositoriesLinkElement = screen.getByText(/Repositories/i);
  expect(repositoriesLinkElement).toBeInTheDocument();
  const developersLinkElement = screen.getByText(/Developers/i);
  expect(developersLinkElement).toBeInTheDocument();
});
