/**
 * Design tokens as CSS custom properties. Components reference them through
 * the `Design` object (`var(${Design.Color.Text})`) and never use raw values.
 */
export const Design = {
  Color: {
    Background: '--color-background',
    Surface: '--color-surface',
    SurfaceMuted: '--color-surface-muted',
    Border: '--color-border',
    /** Outline of form controls (dropdowns, inputs). */
    BorderStrong: '--color-border-strong',
    Text: '--color-text',
    TextMuted: '--color-text-muted',
    TextInverse: '--color-text-inverse',
    Primary: '--color-primary',
    PrimaryHover: '--color-primary-hover',
    Accent: '--color-accent',
    /** Soft accent fill, e.g. the round city badges. */
    AccentSurface: '--color-accent-surface',
    Success: '--color-success',
    SuccessSurface: '--color-success-surface',
    Danger: '--color-danger',
    DangerSurface: '--color-danger-surface',
    Warning: '--color-warning',
    WarningSurface: '--color-warning-surface',
    Info: '--color-info',
    InfoSurface: '--color-info-surface',
    SidebarStart: '--color-sidebar-start',
    SidebarEnd: '--color-sidebar-end',
    SidebarActive: '--color-sidebar-active',
    Focus: '--color-focus',
    /** Highlighted row in an open dropdown list. */
    OptionActive: '--color-option-active'
  },
  Space: {
    Xxs: '--space-xxs',
    Xs: '--space-xs',
    Sm: '--space-sm',
    Md: '--space-md',
    Lg: '--space-lg',
    Xl: '--space-xl',
    Xxl: '--space-xxl'
  },
  Radius: {
    Sm: '--radius-sm',
    Md: '--radius-md',
    Lg: '--radius-lg',
    Xl: '--radius-xl',
    Pill: '--radius-pill',
    /** Inputs, dropdowns and buttons: square, editorial look. */
    Control: '--radius-control'
  },
  Font: {
    /** Body and UI text (geometric sans). */
    Family: '--font-family',
    /** Page, card and section titles (high-contrast serif). */
    Display: '--font-display',
    /** Letter spacing for uppercase labels and buttons. */
    TrackingWide: '--font-tracking-wide',
    SizeXs: '--font-size-xs',
    SizeSm: '--font-size-sm',
    SizeMd: '--font-size-md',
    SizeLg: '--font-size-lg',
    SizeXl: '--font-size-xl',
    SizeXxl: '--font-size-xxl',
    SizeDisplay: '--font-size-display'
  },
  Shadow: {
    Card: '--shadow-card',
    Raised: '--shadow-raised'
  }
} as const;

export const tokenValues: Record<string, string> = {
  [Design.Color.Background]: '#f1f2f4',
  [Design.Color.Surface]: '#ffffff',
  [Design.Color.SurfaceMuted]: '#f6f7f8',
  [Design.Color.Border]: '#e3e5e8',
  [Design.Color.BorderStrong]: '#262626',
  [Design.Color.Text]: '#1d2433',
  [Design.Color.TextMuted]: '#5f6774',
  [Design.Color.TextInverse]: '#ffffff',
  [Design.Color.Primary]: '#262626',
  [Design.Color.PrimaryHover]: '#000000',
  [Design.Color.Accent]: '#1f7a8c',
  [Design.Color.AccentSurface]: '#e4f0f2',
  [Design.Color.Success]: '#2e7d32',
  [Design.Color.SuccessSurface]: '#e8f5e9',
  [Design.Color.Danger]: '#c62828',
  [Design.Color.DangerSurface]: '#fdecea',
  [Design.Color.Warning]: '#9a6700',
  [Design.Color.WarningSurface]: '#fff6db',
  [Design.Color.Info]: '#1f5f99',
  [Design.Color.InfoSurface]: '#e8f1fb',
  [Design.Color.SidebarStart]: '#1d4f5e',
  [Design.Color.SidebarEnd]: '#172b4a',
  [Design.Color.SidebarActive]: 'rgba(255, 255, 255, 0.14)',
  [Design.Color.Focus]: '#4aa3b5',
  [Design.Color.OptionActive]: '#adadad',
  [Design.Space.Xxs]: '4px',
  [Design.Space.Xs]: '8px',
  [Design.Space.Sm]: '12px',
  [Design.Space.Md]: '16px',
  [Design.Space.Lg]: '24px',
  [Design.Space.Xl]: '32px',
  [Design.Space.Xxl]: '48px',
  [Design.Radius.Sm]: '6px',
  [Design.Radius.Md]: '10px',
  [Design.Radius.Lg]: '16px',
  [Design.Radius.Xl]: '24px',
  [Design.Radius.Pill]: '999px',
  [Design.Radius.Control]: '0px',
  // Jost and Libre Caslon Display are open-source stand-ins for the licensed
  // Futura PT / editorial serif pairing; swap the first family here (and the
  // @fontsource imports in main.tsx) to change the typeface app-wide.
  [Design.Font.Family]:
    "'Jost', 'Futura PT', Futura, 'Century Gothic', system-ui, sans-serif",
  [Design.Font.Display]:
    "'Libre Caslon Display', 'Big Caslon', 'Libre Caslon Text', Georgia, serif",
  [Design.Font.TrackingWide]: '0.16em',
  [Design.Font.SizeXs]: '0.75rem',
  [Design.Font.SizeSm]: '0.875rem',
  [Design.Font.SizeMd]: '1rem',
  [Design.Font.SizeLg]: '1.125rem',
  [Design.Font.SizeXl]: '1.5rem',
  [Design.Font.SizeXxl]: '2rem',
  [Design.Font.SizeDisplay]: 'clamp(2.25rem, 5vw, 3.5rem)',
  [Design.Shadow.Card]: '0 1px 2px rgba(16, 24, 40, 0.04)',
  [Design.Shadow.Raised]: '0 12px 32px rgba(16, 24, 40, 0.12)'
};

export const BREAKPOINTS = {
  sm: '600px',
  md: '900px',
  lg: '1200px'
} as const;
