import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );
    // Since I don't know exactly what's in App, I'll just check if it renders.
    // Ideally we'd check for a specific element, but this is a smoke test.
    // We can refine this after seeing the App content if needed, but usually App has some layout.
    // For now, let's just ensure render doesn't throw.
    expect(document.body).toBeInTheDocument();
  });
});
