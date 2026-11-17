import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import Components from '../src/pages/Components';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

function openComponent(name) {
  render(<Components />);
  const cards = screen.getAllByRole('button', { name: /open component/i });
  const order = ['Button', 'Text field', 'Status badge', 'Content card', 'Avatar', 'Navigation bar', 'Modal dialog', 'Dropdown select', 'Tabs', 'Checkbox'];
  fireEvent.click(cards[order.indexOf(name)]);
}

describe('Modal dialog keyboard behaviour', () => {
  it('moves focus into the dialog, closes on Escape and restores focus', () => {
    openComponent('Modal dialog');
    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps Tab inside the dialog', () => {
    openComponent('Modal dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    const dialog = screen.getByRole('dialog');
    const buttons = dialog.querySelectorAll('button');
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });
});

describe('Tabs keyboard behaviour', () => {
  it('moves between tabs with the arrow keys and uses a roving tabindex', () => {
    openComponent('Tabs');
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
    fireEvent.keyDown(tabs[1], { key: 'End' });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });
});
