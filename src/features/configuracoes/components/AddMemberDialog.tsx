'use client'

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  newMemberName: string;
  setNewMemberName: (name: string) => void;
  newMemberEmail: string;
  setNewMemberEmail: (email: string) => void;
  newMemberRole: string;
  setNewMemberRole: (role: string) => void;
}

export function AddMemberDialog({
  isOpen,
  onClose,
  onSubmit,
  loading,
  newMemberName,
  setNewMemberName,
  newMemberEmail,
  setNewMemberEmail,
  newMemberRole,
  setNewMemberRole
}: AddMemberDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[50]">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Adicionar novo membro
          </Dialog.Title>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="memberName" className="text-sm font-medium text-gray-700">
                Nome *
              </label>
              <Input
                id="memberName"
                type="text"
                placeholder="Nome do membro"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="memberEmail" className="text-sm font-medium text-gray-700">
                Email *
              </label>
              <Input
                id="memberEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="memberRole" className="text-sm font-medium text-gray-700">
                Função
              </label>
              <select
                id="memberRole"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Adicionando..." : "Adicionar membro"}
              </Button>
            </div>
          </form>
          
          <Dialog.Close asChild>
            <button 
              className="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              disabled={loading}
            >
              <X size={18} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 