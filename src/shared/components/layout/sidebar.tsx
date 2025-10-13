'use client'

import { FileText, FolderClock, LogOut, Settings2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { Separator } from "@/shared/components/ui/separator"
import NavItem from "@/shared/components/ui/nav-item"
import { createBrowserSupabaseClient } from "@/shared/lib/supabase"
import { Button } from "@/shared/components/ui/button"

const NavItems = [
    { label: 'Notas fiscais', href: '/notas', icon: FileText },
    { label: 'Histórico', href: '/historico', icon: FolderClock },
    { label: 'Configurações', href: '/configuracoes', icon: Settings2 },
]

export default function Sidebar() {
    const pathname = usePathname() || '/'
    const [userName, setUserName] = useState<string>("")

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const supabase = createBrowserSupabaseClient()
                const { data: { user }, error } = await supabase.auth.getUser()
                
                if (error) {
                    console.error("Erro ao buscar usuário:", error)
                    return
                }
                
                if (user?.user_metadata?.display_name) {
                    // Pegar apenas o primeiro nome
                    const fullName = user.user_metadata.display_name
                    const firstName = fullName.split(' ')[0]
                    setUserName(firstName)
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error)
            }
        }
        
        fetchUserData()
    }, [])

    const handleLogout = async () => {
        try {
            const supabase = createBrowserSupabaseClient()
            await supabase.auth.signOut()
            window.location.href = '/'
        } catch (error) {
            console.error("Erro ao fazer logout:", error)
        }
    }

    return (
        <div className="h-screen w-[274px] border-r bg-white flex flex-col">
            <div className="flex flex-col p-3.5 flex-grow">
                {/* Logo */}
                <div className="flex items-center justify-center mt-12">
                    <Link href="/notas">
                        <Image src="/logo.svg" alt="Superia" width={200} height={200} />
                    </Link>
                </div>

                <Separator className="my-6 opacity-0" />

                {/* Menu de Navegação */}
                <nav className="flex-1 space-y-3 mt-10">
                    {NavItems.map((item) => (
                        <NavItem
                            key={item.href}
                            label={item.label}
                            href={item.href}
                            icon={item.icon}
                            isActive={pathname === item.href}
                        />
                    ))}
                </nav>
            </div>
            
            {/* Nome do usuário e Logout */}
            <div className="p-4">
                {userName && (
                    <div className="flex items-center justify-center mb-3">
                        <div className="text-center">
                            <p className="text-gray-500 text-xs">Olá,</p>
                            <p className="font-medium text-base text-secondary">{userName}</p>
                        </div>
                    </div>
                )}
                
                <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 border-gray-200 mt-1 cursor-pointer"
                    onClick={handleLogout}
                >
                    <LogOut size={16} />
                    <span>Fazer logout</span>
                </Button>
            </div>
        </div>
    )
}