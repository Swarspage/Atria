import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Components from '../src/pages/Components.jsx';
import Tokens from '../src/pages/Tokens.jsx';
import Foundations from '../src/pages/Foundations.jsx';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

beforeEach(() => {
  window.localStorage.clear();
});

describe('Components theme previews', () => {
  it('toggles between light and dark preview modes', () => {
    render(<Components />);
    
    const lightToggle = screen.getByRole('button', { name: /light theme preview/i });
    const darkToggle = screen.getByRole('button', { name: /dark theme preview/i });
    
    expect(lightToggle).toHaveAttribute('aria-pressed', 'true');
    expect(darkToggle).toHaveAttribute('aria-pressed', 'false');

    // Default stage is light
    const stage = document.querySelector('[data-theme]');
    expect(stage).toHaveAttribute('data-theme', 'light');

    // Switch to dark theme
    fireEvent.click(darkToggle);
    expect(lightToggle).toHaveAttribute('aria-pressed', 'false');
    expect(darkToggle).toHaveAttribute('aria-pressed', 'true');
    expect(stage).toHaveAttribute('data-theme', 'dark');

    // Switch back to light theme
    fireEvent.click(lightToggle);
    expect(lightToggle).toHaveAttribute('aria-pressed', 'true');
    expect(stage).toHaveAttribute('data-theme', 'light');
  });

  it('keeps modal dialog keyboard trapping and closing functional in dark mode', () => {
    render(<Components />);
    
    // Switch to dark mode
    fireEvent.click(screen.getByRole('button', { name: /dark theme preview/i }));
    
    // Select modal component from sidebar
    const modalNavBtn = screen.getAllByRole('button', { name: /modal dialog/i })[0];
    fireEvent.click(modalNavBtn);

    const openBtn = screen.getByRole('button', { name: 'Open dialog' });
    openBtn.focus();
    fireEvent.click(openBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Escape closes modal
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(openBtn);
  });

  it('keeps tabs roving tabindex and arrow navigation working in dark mode', () => {
    render(<Components />);
    
    // Switch to dark mode
    fireEvent.click(screen.getByRole('button', { name: /dark theme preview/i }));
    
    // Select tabs component from sidebar
    const tabsNavBtn = screen.getAllByRole('button', { name: /tabs/i })[0];
    fireEvent.click(tabsNavBtn);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[1]);
  });
});

describe('Tokens theme previews', () => {
  it('toggles token cards into dark preview without altering stored token values', () => {
    render(<Tokens />);

    const lightToggle = screen.getByRole('button', { name: /light theme preview/i });
    const darkToggle = screen.getByRole('button', { name: /dark theme preview/i });

    // Initial state
    expect(lightToggle).toHaveAttribute('aria-pressed', 'true');
    const container = document.querySelector('[data-theme]');
    expect(container).toHaveAttribute('data-theme', 'light');

    // Check a color input value before toggling
    const colorInputs = screen.getAllByLabelText(/token colour/i);
    const initialColors = colorInputs.map((i) => i.value);

    // Switch to dark mode preview
    fireEvent.click(darkToggle);
    expect(container).toHaveAttribute('data-theme', 'dark');

    // Ensure color values did not change
    const afterColors = screen.getAllByLabelText(/token colour/i).map((i) => i.value);
    expect(afterColors).toEqual(initialColors);

    // Ensure color swatches in dark mode have contrast box-shadow
    const firstColorInput = screen.getAllByLabelText(/token colour/i)[0];
    expect(firstColorInput.style.boxShadow).toMatch(/rgba\(255,\s*255,\s*255/);

    // Switch back to light mode preview
    fireEvent.click(lightToggle);
    expect(container).toHaveAttribute('data-theme', 'light');
    expect(firstColorInput.style.boxShadow).toMatch(/rgba\(0,\s*0,\s*0/);
  });

  it('opens token detail dialog in theme-aware mode', () => {
    render(<Tokens />);
    
    // Switch to dark mode
    fireEvent.click(screen.getByRole('button', { name: /dark theme preview/i }));

    const openButtons = screen.getAllByRole('button', { name: /open token/i });
    fireEvent.click(openButtons[0]);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.style.background).toBe('rgb(28, 28, 31)');

    fireEvent.click(screen.getByRole('button', { name: /close token details/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Foundations resource detail theme previews', () => {
  it('toggles palette detail preview to dark without mutating custom values', () => {
    render(
      <MemoryRouter initialEntries={['/explore/foundations/colour/neutral']}>
        <Routes>
          <Route path="/explore/foundations/:categoryId/:resourceId" element={<Foundations />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Neutral & Minimal' })).toBeInTheDocument();

    const lightToggle = screen.getByRole('button', { name: /light theme preview/i });
    const darkToggle = screen.getByRole('button', { name: /dark theme preview/i });

    // Initial theme
    expect(lightToggle).toHaveAttribute('aria-pressed', 'true');
    const container = document.querySelector('[data-theme]');
    expect(container).toHaveAttribute('data-theme', 'light');

    // Switch to dark mode
    fireEvent.click(darkToggle);
    expect(container).toHaveAttribute('data-theme', 'dark');

    // Swatches should have contrast shadow
    const swatches = screen.getAllByLabelText(/colour$/i);
    expect(swatches[0].style.boxShadow).toMatch(/rgba\(255,\s*255,\s*255/);

    // Switch back to light
    fireEvent.click(lightToggle);
    expect(container).toHaveAttribute('data-theme', 'light');
    expect(swatches[0].style.boxShadow).toMatch(/rgba\(0,\s*0,\s*0/);
  });
});
