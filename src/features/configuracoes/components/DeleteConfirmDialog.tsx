'use client'

import { Button } from "@/shared/components/ui/button";
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  memberName?: string;
}

export function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  memberName 
}: DeleteConfirmDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[50]">
          <Dialog.Title className="text-lg font-semibold mb-2 text-red-600">
            Confirmar exclusão
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            {memberName ? 
              `Tem certeza que deseja excluir o membro "${memberName}"? Esta ação não pode ser desfeita.` :
              "Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita."
            }
          </Dialog.Description>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="border-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
          
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