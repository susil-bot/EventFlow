import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

/**
 * Header (left) and action bar (right) over the form card. The action bar
 * is a direct child of this grid so it can stay sticky the whole way down.
 */
export const EditorLayout = styled.div.withConfig({
  displayName: 'EventEditor'
})`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(${Design.Space.Lg});
  /* Room for the bottom action bar on phones. */
  padding-bottom: 96px;

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(${Design.Space.Xl});
    padding-bottom: 0;
  }
`;

export const EditorHeaderSlot = styled.div.withConfig({
  displayName: 'EventEditorHeader'
})`
  min-width: 0;
`;

export const EditorActionsSlot = styled.div.withConfig({
  displayName: 'EventEditorActions'
})`
  @media (min-width: ${BREAKPOINTS.md}) {
    position: sticky;
    top: calc(var(--site-header-height, 0px) + var(${Design.Space.Md}));
    z-index: 45;
    align-self: start;
    grid-column: 2;
    grid-row: 1;
  }
`;

/** The white card holding every field. */
export const StyledForm = styled.form.withConfig({
  displayName: 'EventForm'
})`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xl});
  padding: var(${Design.Space.Lg});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Sm});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Card});

  @media (min-width: ${BREAKPOINTS.md}) {
    padding: var(${Design.Space.Xl}) var(${Design.Space.Xxl});
  }
`;

export const FormSection = styled.fieldset.withConfig({
  displayName: 'EventFormSection'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Md});
  margin: 0;
  padding: 0;
  border: 0;
`;

export const FormSectionTitle = styled.legend.withConfig({
  displayName: 'EventFormSectionTitle'
})`
  margin-bottom: var(${Design.Space.Md});
  font-size: var(${Design.Font.SizeLg});
  font-weight: 600;
`;

/** A heading inside a section, e.g. "Listing in Discover". */
export const FormSubsectionTitle = styled.h3.withConfig({
  displayName: 'EventFormSubsectionTitle'
})`
  margin: var(${Design.Space.Sm}) 0 0;
  padding-top: var(${Design.Space.Md});
  border-top: 1px solid var(${Design.Color.Border});
  font-family: inherit;
  font-size: var(${Design.Font.SizeMd});
  font-weight: 600;
  letter-spacing: normal;
`;

/** A field and the follow-up field it reveals, stacked with a gap. */
export const FieldStack = styled.div.withConfig({
  displayName: 'EventFormFieldStack'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
`;

export const FormGrid = styled.div.withConfig({
  displayName: 'EventFormGrid'
})`
  display: grid;
  gap: var(${Design.Space.Md});

  @media (min-width: ${BREAKPOINTS.sm}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const FormActions = styled.div.withConfig({
  displayName: 'EventFormActions'
})`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(${Design.Space.Sm});
  padding-top: var(${Design.Space.Md});
  border-top: 1px solid var(${Design.Color.Border});
`;

export const SectionNote = styled.p.withConfig({
  displayName: 'EventFormSectionNote'
})`
  margin-bottom: var(${Design.Space.Xs});
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeSm});
`;
