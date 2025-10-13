import { useConfiguracoes } from "../hooks/useConfiguracoes";
import { MembrosSection } from "./MembrosSection";
import { UserProfileCard } from "./UserProfileCard";

/**
 * Componente principal da página de configurações
 */
export function ConfiguracoesPage() {
  const {
    // Estado do usuário
    email,
    currentUser,
    
    // Estado do formulário de adição
    isDialogOpen,
    setIsDialogOpen,
    newMemberName,
    setNewMemberName,
    newMemberEmail,
    setNewMemberEmail,
    newMemberRole,
    setNewMemberRole,
    
    // Estados de loading
    loading,
    loadingMembers,
    
    // Estado dos membros
    members,
    
    // Estado de paginação
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Handlers
    handleAddMember,
    handleRemoveMember,
    handleEditMember,
    handleResendInviteOrResetPassword,
    resetForm
  } = useConfiguracoes();

  return (
    <div className="w-full flex flex-col h-screen pt-12 pl-6 pr-16 pb-10 gap-6 overflow-hidden">
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <h2 className="text-2xl font-semibold text-black">
          Configuração
        </h2>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Seção de membros da equipe */}
          <MembrosSection
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            newMemberName={newMemberName}
            setNewMemberName={setNewMemberName}
            newMemberEmail={newMemberEmail}
            setNewMemberEmail={setNewMemberEmail}
            newMemberRole={newMemberRole}
            setNewMemberRole={setNewMemberRole}
            loading={loading}
            loadingMembers={loadingMembers}
            members={members}
            currentUser={currentUser}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            handleAddMember={handleAddMember}
            handleRemoveMember={handleRemoveMember}
            handleEditMember={handleEditMember}
            handleResendInviteOrResetPassword={handleResendInviteOrResetPassword}
            resetForm={resetForm}
          />

          {/* Seção do perfil do usuário */}
          <UserProfileCard
            email={email}
            currentUser={currentUser}
            members={members}
          />
        </div>
      </div>
    </div>
  );
} 