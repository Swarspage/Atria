import React from 'react';
import { Sun, Moon } from '@phosphor-icons/react';

export default function ThemePreviewToggle({
  mode,
  onChange,
  label = 'Preview theme',
}) {
  const isLight = mode === 'light';
  const isDark = mode === 'dark';

  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--line)',
        borderRadius: 4,
        background: '#fff',
        padding: 2,
        gap: 2,
      }}
    >
      <button
        type="button"
        aria-pressed={isLight}
        aria-label="Light theme preview"
        onClick={() => onChange('light')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 9px',
          border: 0,
          borderRadius: 3,
          background: isLight ? '#242420' : 'transparent',
          color: isLight ? '#fff' : '#6f6d67',
          fontSize: 10,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s ease, color 0.15s ease',
          outlineOffset: 2,
        }}
      >
        <Sun size={13} weight={isLight ? 'bold' : 'regular'} />
        <span>Light</span>
      </button>

      <button
        type="button"
        aria-pressed={isDark}
        aria-label="Dark theme preview"
        onClick={() => onChange('dark')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 9px',
          border: 0,
          borderRadius: 3,
          background: isDark ? '#242420' : 'transparent',
          color: isDark ? '#fff' : '#6f6d67',
          fontSize: 10,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s ease, color 0.15s ease',
          outlineOffset: 2,
        }}
      >
        <Moon size={13} weight={isDark ? 'bold' : 'regular'} />
        <span>Dark</span>
      </button>
    </div>
  );
}

