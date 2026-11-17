import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App.jsx';

function loadDocument(path) {
  cleanup();
  window.history.replaceState({}, '', path);
  return render(<App />);
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('primary navigation journeys', () => {
  it('offers working Explore Library and Open Studio landing destinations', () => {
    loadDocument('/');
    const explore = screen.getByRole('link', { name: /explore library/i });
    const studio = screen.getByRole('link', { name: /open studio/i });
    expect(explore).toHaveAttribute('href', '/explore');
    expect(studio).toHaveAttribute('href', '/studio');
    const explorePath = explore.getAttribute('href');
    const studioPath = studio.getAttribute('href');

    // Native anchors load a new document; jsdom cannot perform that navigation.
    loadDocument(explorePath);
    expect(screen.getByRole('heading', { name: /good design starts with a system/i })).toBeInTheDocument();
    loadDocument(studioPath);
    expect(screen.getByRole('textbox', { name: 'Design system name' })).toBeInTheDocument();
  });

  it.each([
    ['Foundations', 'START WITH THE BASICS', '/explore/foundations'],
    ['Tokens', 'DESIGN DECISIONS', '/explore/tokens'],
    ['Components', 'REUSABLE UI', '/explore/components'],
  ])('opens the %s module from the Explore overview', (heading, entry, path) => {
    loadDocument('/explore');
    const modules = screen.getByRole('heading', { name: 'Your building blocks.' }).closest('section');
    expect(within(modules).getAllByRole('link')).toHaveLength(3);
    const link = within(modules).getByRole('link', { name: new RegExp(entry) });
    expect(link).toHaveAttribute('href', path);

    fireEvent.click(link);
    expect(window.location.pathname).toBe(path);
    expect(screen.getByRole('heading', { name: heading, exact: true })).toBeInTheDocument();
  });

  it('opens Studio from the Explore section navigation', () => {
    loadDocument('/explore');
    const link = screen.getByRole('link', { name: /^Studio 04$/ });
    expect(link).toHaveAttribute('href', '/studio');
    loadDocument(link.getAttribute('href'));
    expect(screen.getByRole('textbox', { name: 'Design system name' })).toBeInTheDocument();
  });

  it('returns from Studio to Explore and then the landing page', () => {
    loadDocument('/studio');
    fireEvent.click(screen.getByRole('link', { name: /explore library/i }));
    expect(window.location.pathname).toBe('/explore');
    expect(screen.getByRole('heading', { name: 'Your building blocks.' })).toBeInTheDocument();
    const navigation = screen.getByRole('navigation', { name: 'Explore Studio navigation' });
    const home = within(navigation).getByRole('link', { name: 'Atria home' });
    expect(home).toHaveAttribute('href', '/');
    loadDocument(home.getAttribute('href'));
    expect(screen.getByRole('heading', { name: /make consistency feel effortless/i })).toBeInTheDocument();
  });

  it('returns directly to the landing page through the Studio Atria link', () => {
    loadDocument('/studio');
    fireEvent.click(screen.getByRole('link', { name: 'Atria', exact: true }));
    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { name: /make consistency feel effortless/i })).toBeInTheDocument();
  });
});

describe('direct nested route entry', () => {
  it.each([
    ['/explore/foundations', 'Foundations'],
    ['/explore/tokens', 'Tokens'],
    ['/explore/components', 'Components'],
    ['/explore/foundations/colour/warm-earth', 'Warm Earth'],
  ])('keeps %s on a fresh mount at the same URL', (path, heading) => {
    const view = loadDocument(path);
    expect(window.location.pathname).toBe(path);
    expect(screen.getByRole('heading', { name: heading, exact: true })).toBeInTheDocument();

    view.unmount();
    render(<App />);
    expect(window.location.pathname).toBe(path);
    expect(screen.getByRole('heading', { name: heading, exact: true })).toBeInTheDocument();
  });
});
