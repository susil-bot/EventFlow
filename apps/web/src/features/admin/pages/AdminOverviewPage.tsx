import React from 'react';
import { LinkButton } from '@/shared/ui/button';
import { AdminStats } from '../components/admin-stats';
import { AuditLogList } from '../components/audit-log-list';
import { PageHeader } from '@/shared/ui/page-header';
import { StateView } from '@/shared/ui/state-view';
import { useAdminStats, useAuditLog } from '../hooks/use-admin';
import { SectionTitle } from './styles';

export const AdminOverviewPage = () => {
  const stats = useAdminStats();
  const audit = useAuditLog();
  const pending = stats.data?.pendingOrganizers ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Approve organizers, moderate events and review every admin action."
        actions={
          pending > 0 ? (
            <LinkButton to="/admin/users?status=PENDING_APPROVAL">
              Review {pending} pending organizer{pending === 1 ? '' : 's'}
            </LinkButton>
          ) : null
        }
      />
      <StateView
        isLoading={stats.isLoading}
        loadingLabel="Loading platform stats"
        error={stats.error}
        onRetry={() => void stats.refetch()}
      >
        {stats.data ? <AdminStats stats={stats.data} /> : null}
      </StateView>

      <SectionTitle>Recent admin activity</SectionTitle>
      <StateView
        isLoading={audit.isLoading}
        loadingLabel="Loading the audit log"
        error={audit.error}
        onRetry={() => void audit.refetch()}
        isEmpty={audit.data?.length === 0}
        emptyIcon="check"
        emptyTitle="No admin actions yet"
      >
        <AuditLogList entries={audit.data ?? []} />
      </StateView>
    </>
  );
};
