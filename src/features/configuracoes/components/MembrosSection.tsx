import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import * as Dialog from '@radix-ui/react-dialog'
import { Edit, KeyRound, Mail, Plus, Trash2, X } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { useState, useCallback } from "react"
import { MemberUpdateData } from "../types"
import { Pagination } from "@/shared/components/common/pagination"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { MemberActions } from "./MemberActions"
import { MemberStatusBadge } from "./MemberStatusBadge"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import { AddMemberDialog } from "./AddMemberDialog"
import { 
  getDisplayName, 
  formatRole, 
  isAdmin, 
  isEmptyMembers,
  validateMemberUpdateData 
} from "../utils/memberUtils"
import { toast } from "sonner"

interface MembersSectionProps {
    isDialogOpen: boolean
    setIsDialogOpen: (isOpen: boolean) => void
    newMemberName: string
    setNewMemberName: (name: string) => void
    newMemberEmail: string
    setNewMemberEmail: (email: string) => void
    newMemberRole: string
    setNewMemberRole: (role: string) => void
    loading: boolean
    loadingMembers: boolean
    members: User[]
    currentUser: User | null
    currentPage: number
    setCurrentPage: (page: number) => void
    totalPages: number
    handleAddMember: (e: React.FormEvent) => void
    handleRemoveMember: (id: string) => void
    handleEditMember: (id: string, userData: MemberUpdateData) => Promise<boolean>
    handleResendInviteOrResetPassword: (email: string) => Promise<void>
    resetForm: () => void
}

// Componente para estado de carregamento
const LoadingState = () => (
    <TableRow>
        <TableCell colSpan={5} className="text-center py-12">
            <div className="flex flex-col justify-center items-center">
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.2s_ease-in-out_infinite]"></div>
                    <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.2s_ease-in-out_infinite_0.2s]"></div>
                    <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.2s_ease-in-out_infinite_0.4s]"></div>
                </div>
                <span className="text-gray-500 font-medium">Carregando membros...</span>
            </div>
        </TableCell>
    </TableRow>
)

// Componente para estado vazio
const EmptyState = () => (
    <TableRow>
        <TableCell colSpan={5} className="text-center py-12">
            <div className="text-gray-500">
                <p className="text-lg font-medium mb-2">Nenhum membro encontrado</p>
                <p className="text-sm">Adicione o primeiro membro à equipe</p>
            </div>
        </TableCell>
    </TableRow>
)

export function MembrosSection({
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
}: MembersSectionProps) {
    // Estados para diálogos
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editMember, setEditMember] = useState<User | null>(null)
    const [editName, setEditName] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [editRole, setEditRole] = useState("")
    const [editLoading, setEditLoading] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Verificar se é admin
    const userIsAdmin = isAdmin(currentUser)

    // Handlers
    const handleOpenEditDialog = useCallback((member: User) => {
        setEditMember(member)
        setEditName(member.user_metadata?.display_name || "")
        setEditEmail(member.email || "")
        
        // Validar e normalizar a role
        let role = member.user_metadata?.role || ""
        if (role !== "user" && role !== "admin") {
            role = "user" // Valor padrão se não for uma role válida
        }
        setEditRole(role)
        
        setEditDialogOpen(true)
    }, [])

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!editMember?.id) return
        
        // Fechar o diálogo imediatamente para melhor experiência do usuário
        setEditDialogOpen(false)
        
        // Definir estado de carregamento
        setEditLoading(true)
        
        // Chamar a API para atualizar o membro
        await handleEditMember(editMember.id, {
            displayName: editName,
            role: editRole
        })
        
        // Resetar estado de carregamento
        setEditLoading(false)
    }

    const handleResetPassword = async () => {
        if (!editEmail) return
        
        // Fechar o diálogo imediatamente
        setEditDialogOpen(false)
        
        // Definir estado de carregamento
        setResetLoading(true)
        
        // Chamar a API
        await handleResendInviteOrResetPassword(editEmail)
        
        // Resetar estado de carregamento
        setResetLoading(false)
    }

    const handleOpenDeleteDialog = useCallback((id: string, name: string) => {
        setMemberToDelete({ id, name })
        setDeleteDialogOpen(true)
    }, [])

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false)
        setMemberToDelete(null)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (!memberToDelete) return
        
        setDeleteLoading(true)
        await handleRemoveMember(memberToDelete.id)
        setDeleteLoading(false)
        handleCloseDeleteDialog()
    }, [memberToDelete, handleRemoveMember, handleCloseDeleteDialog])

    // Renderizar conteúdo da tabela
    const renderTableContent = () => {
        if (loadingMembers) {
            return <LoadingState />
        }

        if (isEmptyMembers(members)) {
            return <EmptyState />
        }

        return members.map((member) => (
            <TableRow key={member.id}>
                <TableCell>
                    {getDisplayName(member)}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                    {member.user_metadata?.role === "admin" 
                        ? "Administrador" 
                        : "Usuário"}
                </TableCell>
                <TableCell>
                    <MemberStatusBadge member={member} />
                </TableCell>
                <TableCell className="text-right">
                    <MemberActions
                        member={member}
                        currentUser={currentUser}
                        onEdit={handleOpenEditDialog}
                        onResetPassword={handleResendInviteOrResetPassword}
                        onDelete={(id) => handleOpenDeleteDialog(id, getDisplayName(member))}
                        loading={loading}
                    />
                </TableCell>
            </TableRow>
        ))
    }

    return (
        <div className="flex flex-col items-start gap-4 w-3/4">
            <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-medium text-dark-gray">
                    Membros
                </h2>
                
                {userIsAdmin && (
                    <Button 
                        variant="outline" 
                        className="gap-1 rounded-full text-green-500 border border-green-500 hover:bg-green-50"
                        onClick={() => setIsDialogOpen(true)} 
                        disabled={loading}
                    >
                        <Plus size={18} />
                        Adicionar membro
                    </Button>
                )}
            </div>

            <div className="bg-white border border-border rounded-lg p-4 w-full flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <Table>
                        <TableHeader className={loadingMembers ? "hidden" : ""}>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderTableContent()}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                {!loadingMembers && !isEmptyMembers(members) && totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            loading={loadingMembers}
                        />
                    </div>
                )}
            </div>

            {/* Diálogos */}
            <AddMemberDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false)
                    resetForm()
                }}
                onSubmit={handleAddMember}
                loading={loading}
                newMemberName={newMemberName}
                setNewMemberName={setNewMemberName}
                newMemberEmail={newMemberEmail}
                setNewMemberEmail={setNewMemberEmail}
                newMemberRole={newMemberRole}
                setNewMemberRole={setNewMemberRole}
            />

            {/* Diálogo de edição de membro */}
            <Dialog.Root open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
                        <Dialog.Title className="text-lg font-semibold mb-2">
                            Editar membro
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-4">
                            Atualize as informações do membro.
                        </Dialog.Description>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="edit-name" className="text-right text-sm font-medium">
                                        Nome
                                    </label>
                                    <Input
                                        id="edit-name"
                                        placeholder="Nome do membro"
                                        className="col-span-3"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="edit-email" className="text-right text-sm font-medium">
                                        Email
                                    </label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        className="col-span-3"
                                        value={editEmail}
                                        disabled
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="edit-role" className="text-right text-sm font-medium">
                                        Tipo
                                    </label>
                                    <div className="col-span-3 flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="edit-role"
                                                value="user"
                                                checked={editRole === "user"}
                                                onChange={() => setEditRole("user")}
                                            />
                                            Usuário
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="edit-role"
                                                value="admin"
                                                checked={editRole === "admin"}
                                                onChange={() => setEditRole("admin")}
                                            />
                                            Administrador
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between gap-2 mt-4">
                                <Button 
                                    type="button" 
                                    onClick={handleResetPassword}
                                    variant="outline"
                                    className="text-blue-500 border-blue-200"
                                    disabled={resetLoading}
                                >
                                    {editMember?.email_confirmed_at ? (
                                        <KeyRound size={16} className="mr-1" />
                                    ) : (
                                        <Mail size={16} className="mr-1" />
                                    )}
                                    {editMember?.email_confirmed_at ? "Redefinir senha" : "Reenviar convite"}
                                </Button>
                                <div className="flex gap-2">
                                    <Dialog.Close asChild>
                                        <Button type="button" variant="outline" className="border-gray-300">
                                            Cancelar
                                        </Button>
                                    </Dialog.Close>
                                    <Button type="submit" className="bg-primary text-white" disabled={editLoading}>
                                        {editLoading ? "Salvando..." : "Salvar alterações"}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <Dialog.Close asChild>
                            <button className="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
                memberName={memberToDelete?.name}
            />
        </div>
    )
} 