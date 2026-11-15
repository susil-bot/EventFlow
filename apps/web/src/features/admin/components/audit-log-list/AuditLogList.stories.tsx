import type { Meta, StoryObj } from '@storybook/react-vite';
import { auditEntries } from '@/shared/test/fixtures/events';
import { AuditLogList } from './AuditLogList';

const meta: Meta<typeof AuditLogList> = {
  title: 'Patterns/AuditLogList',
  component: AuditLogList,
  args: { entries: auditEntries }
};

export default meta;

type Story = StoryObj<typeof AuditLogList>;

export const Default: Story = {};
