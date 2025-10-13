'use client'

import { MembrosSection } from "@/features/configuracoes/components/MembrosSection"
import { UserProfileCard } from "@/features/configuracoes/components/UserProfileCard"
import { useConfiguracoes } from "@/features/configuracoes/hooks/useConfiguracoes"

export default function Configuracoes() {
    const {
        email,
        isDialogOpen,
        setIsDialogOpen,
        newMemberName,
        setNewMemberName,
        newMemberEmail,
        setNewMemberEmail,
        newMemberRole,
        setNewMemberRole,
        loading,
        loadingMembers,
        members,
        currentUser,
        currentPage,
        setCurrentPage,
        totalPages,
        handleAddMember,
        handleRemoveMember,
        handleEditMember,
        handleResendInviteOrResetPassword,
        resetForm
    } = useConfiguracoes()

    return (
        <div className="w-full max-h-screen flex flex-col pt-20 pl-6 pr-16 pb-6 overflow-hidden">
            <h1 className="text-2xl font-semibold text-black mb-4">
                Configuração
            </h1>
            
            <div className="flex gap-4 w-full flex-grow h-[600px]">
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
                
                <UserProfileCard 
                    currentUser={currentUser}
                    email={email}
                    members={members}
                />
            </div>
        </div>
    )
}