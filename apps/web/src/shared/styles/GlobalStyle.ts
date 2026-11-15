import { createGlobalStyle } from 'styled-components';
import { Design, tokenValues } from './tokens';
import { displayHeading } from './typography';

const tokenDeclarations = Object.entries(tokenValues)
  .map(([name, value]) => `${name}: ${value};`)
  .join('\n');

export const GlobalStyle = createGlobalStyle`
  :root {
    ${tokenDeclarations}
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    font-family: var(${Design.Font.Family});
    font-size: var(${Design.Font.SizeMd});
    line-height: 1.5;
    color: var(${Design.Color.Text});
    background: var(${Design.Color.Background});
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, p {
    margin: 0;
  }

  h1, h2, h3 {
    ${displayHeading}
  }

  a {
    color: inherit;
  }

  :focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
