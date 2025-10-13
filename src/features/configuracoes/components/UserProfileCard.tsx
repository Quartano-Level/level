import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Separator } from "@/shared/components/ui/separator"
import { User } from "@supabase/supabase-js"
import * as Dialog from '@radix-ui/react-dialog'
import { Edit, Key, X } from "lucide-react"
import { useState, useEffect } from "react"

interface UserProfileCardProps {
    currentUser: User | null
    email: string | null
    members?: User[]
}

export function UserProfileCard({ currentUser, email, members = [] }: UserProfileCardProps) {
    const [displayName, setDisplayName] = useState<string>("[Nome do usuário]")
    const [firstLetter, setFirstLetter] = useState<string>("U")
    const [editEmailDialogOpen, setEditEmailDialogOpen] = useState(false)
    const [newEmail, setNewEmail] = useState(email || "")
    const [editPasswordDialogOpen, setEditPasswordDialogOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Se temos uma lista de membros e um usuário atual, procura o membro correspondente
        if (members.length > 0 && currentUser?.id) {
            const userMember = members.find(member => member.id === currentUser.id)

            if (userMember?.user_metadata?.display_name) {
                const name = userMember.user_metadata.display_name.trim()
                setDisplayName(name)

                // Extrair a primeira letra do nome para o avatar
                if (name && name.length > 0) {
                    setFirstLetter(name.charAt(0).toUpperCase())
                }
                return
            }
        }

        // Fallback para o método original se não encontrar o membro
        if (currentUser?.user_metadata?.display_name) {
            const name = currentUser.user_metadata.display_name.trim()
            setDisplayName(name)

            // Extrair a primeira letra do nome para o avatar
            if (name && name.length > 0) {
                setFirstLetter(name.charAt(0).toUpperCase())
            }
        } else if (currentUser?.email) {
            setDisplayName(currentUser.email)
            setFirstLetter(currentUser.email.charAt(0).toUpperCase())
        }
    }, [currentUser, members])

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Implementação futura
            setEditEmailDialogOpen(false)
        } catch (error) {
            console.error("Erro ao atualizar email:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Implementação futura
            setEditPasswordDialogOpen(false)
        } catch (error) {
            console.error("Erro ao atualizar senha:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Card className="w-96 shadow-none bg-white flex justify-center">
                <CardContent className="p-8 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-16 w-full">
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="w-[100px] h-[100px] bg-[#D9D9D9]">
                                <AvatarFallback className="text-2xl font-semibold">
                                    {firstLetter}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col gap-1 text-center">
                                <h2 className="font-semibold text-indigo-900 text-xl">
                                    {displayName}
                                </h2>
                                <p className="font-medium text-indigo-900 text-sm">
                                    {currentUser?.user_metadata?.role === "user"
                                        ? "Usuário"
                                        : currentUser?.user_metadata?.role === "admin"
                                            ? "Administrador"
                                            : "-"
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 w-full mt-2">
                            <div className="flex flex-col justify-center text-sm mb-1 w-full">
                                <span className="text-campos font-light text-sm">{email || "email@superia.com"}</span>
                                <button
                                    className="text-green-500 text-xs font-medium flex items-center gap-1 cursor-pointer"
                                    onClick={() => setEditEmailDialogOpen(true)}
                                >
                                    <Edit size={12} />
                                    Editar email
                                </button>
                                <Separator className="mt-1 w-full" />
                            </div>

                            <div className="flex flex-col justify-center text-sm w-full">
                                <span className="text-campos font-light text-sm">Senha</span>
                                <button
                                    className="text-green-500 text-xs font-medium flex items-center gap-1 cursor-pointer"
                                    onClick={() => setEditPasswordDialogOpen(true)}
                                >
                                    <Key size={12} />
                                    Alterar senha
                                </button>
                                <Separator className="mt-1 w-full" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog para editar email */}
            <Dialog.Root open={editEmailDialogOpen} onOpenChange={setEditEmailDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
                        <Dialog.Title className="text-lg font-semibold mb-2">
                            Atualizar email
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-4">
                            Atualize seu endereço de email abaixo.
                        </Dialog.Description>

                        <form onSubmit={handleUpdateEmail}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="current-email" className="text-right text-sm font-medium">
                                        Email atual
                                    </label>
                                    <Input
                                        id="current-email"
                                        type="email"
                                        value={email || ""}
                                        className="col-span-3"
                                        disabled
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="new-email" className="text-right text-sm font-medium">
                                        Novo email
                                    </label>
                                    <Input
                                        id="new-email"
                                        type="email"
                                        placeholder="novoemail@exemplo.com"
                                        className="col-span-3"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Dialog.Close asChild>
                                    <Button type="button" variant="outline" className="border-gray-300">
                                        Cancelar
                                    </Button>
                                </Dialog.Close>
                                <Button type="submit" className="bg-primary text-white" disabled={loading}>
                                    {loading ? "Atualizando..." : "Atualizar email"}
                                </Button>
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

            {/* Dialog para editar senha */}
            <Dialog.Root open={editPasswordDialogOpen} onOpenChange={setEditPasswordDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
                        <Dialog.Title className="text-lg font-semibold mb-2">
                            Alterar senha
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-4">
                            Digite sua senha atual e a nova senha.
                        </Dialog.Description>

                        <form onSubmit={handleUpdatePassword}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="current-password" className="text-right text-sm font-medium">
                                        Senha atual
                                    </label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        className="col-span-3"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="new-password" className="text-right text-sm font-medium">
                                        Nova senha
                                    </label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        className="col-span-3"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="confirm-password" className="text-right text-sm font-medium">
                                        Confirmar senha
                                    </label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        className="col-span-3"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Dialog.Close asChild>
                                    <Button type="button" variant="outline" className="border-gray-300">
                                        Cancelar
                                    </Button>
                                </Dialog.Close>
                                <Button type="submit" className="bg-primary text-white" disabled={loading}>
                                    {loading ? "Atualizando..." : "Atualizar senha"}
                                </Button>
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
        </>
    )
} 