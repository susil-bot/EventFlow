import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const StyledAuthLayout = styled.div.withConfig({
  displayName: 'AuthLayout'
})`
  display: grid;
  min-height: 100vh;

  main {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(${Design.Space.Lg});
  }

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const AuthHero = styled.div.withConfig({ displayName: 'AuthHero' })`
  display: none;
  position: relative;
  overflow: hidden;
  color: var(${Design.Color.TextInverse});
  background:
    radial-gradient(
      circle at 75% 25%,
      rgba(255, 214, 140, 0.55),
      transparent 30%
    ),
    linear-gradient(
      160deg,
      var(${Design.Color.SidebarStart}),
      var(${Design.Color.SidebarEnd})
    );

  @media (min-width: ${BREAKPOINTS.md}) {
    display: flex;
    align-items: flex-end;
    padding: var(${Design.Space.Xxl});
  }
`;

export const AuthHeroText = styled.p.withConfig({
  displayName: 'AuthHeroText'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
  max-width: 420px;

  strong {
    font-size: var(${Design.Font.SizeXxl});
  }

  span {
    font-size: var(${Design.Font.SizeLg});
    opacity: 0.85;
  }
`;

export const AuthCard = styled.div.withConfig({ displayName: 'AuthCard' })`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Md});
  width: 100%;
  max-width: 420px;
  padding: var(${Design.Space.Xl});
  border-radius: var(${Design.Radius.Xl});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Raised});

  form {
    display: flex;
    flex-direction: column;
    gap: var(${Design.Space.Md});
  }
`;

export const AuthTitle = styled.h1.withConfig({ displayName: 'AuthTitle' })`
  font-size: var(${Design.Font.SizeXxl});
`;

export const AuthSubtitle = styled.p.withConfig({
  displayName: 'AuthSubtitle'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});

  a {
    color: var(${Design.Color.Accent});
    font-weight: 600;
  }
`;
