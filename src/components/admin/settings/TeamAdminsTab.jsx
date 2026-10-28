import { useState, useMemo } from 'react';
import { PlusIcon, ShieldAlertIcon } from '@/icons';
import { toast } from '@/utils/toast';
import { INITIAL_TEAM_ADMINS } from '@/mock/admin/adminSettings.mock';
import { TeamAdminsKPIs } from './TeamAdminsKPIs';
import { TeamAdminsTable } from './TeamAdminsTable';
import { InviteAdminModal } from './InviteAdminModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import { useDebounce } from '@/hooks';

export const TeamAdminsTab = () => {
  const [team, setTeam] = useState(INITIAL_TEAM_ADMINS);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedRole, setSelectedRole] = useState('All roles');
  const [selectedStatus, setSelectedStatus] = useState('All statuses');

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const handleInvite = (newMember) => {
    setTeam((prev) => [...prev, newMember]);
    toast.success(`Invitation sent to ${newMember.email}!`);
  };

  const handleSaveRole = (memberId, newRole) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    toast.success('Member role updated successfully!');
  };

  const handleResendInvite = (member) => {
    toast.info(`Invitation email resent to ${member.email}`);
  };

  const handleToggleSuspend = (id) => {
    setTeam((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextStatus = m.status === 'Suspended' ? 'Active' : 'Suspended';
        toast.info(
          `Account for ${m.name} is now ${nextStatus.toLowerCase()}`
        );
        return { ...m, status: nextStatus };
      })
    );
  };

  const handleRemoveMember = (id, name) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
    toast.info(`Removed ${name} from admin team`);
  };

  // Filtered team
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      if (
        selectedRole !== 'All roles' &&
        member.role.toLowerCase() !== selectedRole.toLowerCase()
      ) {
        return false;
      }
      if (
        selectedStatus !== 'All statuses' &&
        member.status.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      if (debouncedSearchQuery.trim()) {
        const q = debouncedSearchQuery.toLowerCase().trim();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesEmail = member.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [team, selectedRole, selectedStatus, debouncedSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Team & Admins
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
              Marketplace settings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Invite your team and keep marketplace access under control.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon size={16} animateOnHover={false} />
          <span>Invite / Add Admin</span>
        </button>
      </div>

      {/* KPI Cards */}
      <TeamAdminsKPIs team={team} />

      {/* Table Card */}
      <TeamAdminsTable
        team={filteredTeam}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onChangeRole={(member) => setEditingMember(member)}
        onResendInvite={handleResendInvite}
        onToggleSuspend={handleToggleSuspend}
        onRemoveMember={handleRemoveMember}
      />

      {/* Notice 1: Access is based on role, not job title */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 flex items-start gap-3">
        <ShieldAlertIcon size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800">
            Access is based on role, not job title
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Only the Owner / Super Admin can invite admins, change roles or manage marketplace settings. Admins manage business operations; scoped staff only access their assigned modules.
          </p>
        </div>
      </div>

      {/* Card 2: Owner account protection */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Owner account protection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The owner has immutable full control and cannot be removed, suspended or demoted here.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200/60 shrink-0">
            Protected
          </span>
        </div>

        <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 leading-relaxed">
          Ownership changes require a separate verified transfer. Other member actions are available from their access menu; no action takes effect in this static preview.
        </p>
      </div>

      {/* Invite Modal */}
      <InviteAdminModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
      />

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        onSaveRole={handleSaveRole}
      />
    </div>
  );
};

export default TeamAdminsTab;
