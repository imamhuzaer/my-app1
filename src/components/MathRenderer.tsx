import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Normalizes text so that raw LaTeX commands like \frac{a}{b}, \sqrt{x}, \pm, etc.,
 * or expressions wrapped in $, $$, \( \), \[ \] are cleanly rendered via KaTeX.
 */
export function renderMathStringToHtml(text: string): string {
  if (!text) return '';

  let normalized = text;

  // Convert common unicode superscripts to LaTeX ^ notation if needed
  normalized = normalized
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    .replace(/⁰/g, '^0')
    .replace(/ⁿ/g, '^n')
    .replace(/⁺/g, '^+')
    .replace(/⁻/g, '^-');

  // Fix escaped double backslashes
  normalized = normalized.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  // Auto-wrap raw LaTeX commands that are missing $ delimiters
  // e.g., \frac{a}{b}, \sqrt{x}, \pm, \int, \sum, \alpha, \theta, \lim, \le, \ge, etc.
  if (!/\$|\\\(|\\\[/.test(normalized)) {
    // If text contains latex backslash commands or quadratic equations like f(x) = ...
    normalized = normalized.replace(
      /(\\([a-zA-Z]+)(\{[^}]*\}|\^\{[^}]*\}|_[^ ]+|[0-9a-zA-Z\+\-\*\/=]+)*)/g,
      (match) => `$${match}$`
    );
  }

  // Split text into tokens based on $...$ and $$...$$
  const tokens = normalized.split(/(\$\$.*?\$\$|\\\[.*?\\\]|\$.*?\$|\\\([^\)]*\\\))/gs);

  return tokens
    .map((token) => {
      if (!token) return '';

      // Check if token is block math
      if (token.startsWith('$$') && token.endsWith('$$')) {
        const math = token.slice(2, -2).trim();
        try {
          return katex.renderToString(math, { displayMode: true, throwOnError: false });
        } catch {
          return `<div class="katex-error">${escapeHtml(math)}</div>`;
        }
      }
      if (token.startsWith('\\[') && token.endsWith('\\]')) {
        const math = token.slice(2, -2).trim();
        try {
          return katex.renderToString(math, { displayMode: true, throwOnError: false });
        } catch {
          return `<div class="katex-error">${escapeHtml(math)}</div>`;
        }
      }

      // Check if token is inline math
      if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
        const math = token.slice(1, -1).trim();
        try {
          return katex.renderToString(math, { displayMode: false, throwOnError: false });
        } catch {
          return `<span class="katex-error">${escapeHtml(math)}</span>`;
        }
      }
      if (token.startsWith('\\(') && token.endsWith('\\)')) {
        const math = token.slice(2, -2).trim();
        try {
          return katex.renderToString(math, { displayMode: false, throwOnError: false });
        } catch {
          return `<span class="katex-error">${escapeHtml(math)}</span>`;
        }
      }

      // Plain text - convert newlines to <br/>
      return escapeHtml(token).replace(/\n/g, '<br/>');
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  const html = renderMathStringToHtml(text);

  return (
    <span
      className={`inline-math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
