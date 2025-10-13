import { Button } from "@/shared/components/ui/button";
import { Edit, KeyRound, Mail, Trash2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { isAdmin } from "../utils/memberUtils";

interface MemberActionsProps {
  member: User;
  currentUser: User | null;
  onEdit: (member: User) => void;
  onResetPassword: (email: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function MemberActions({
  member,
  currentUser,
  onEdit,
  onResetPassword,
  onDelete,
  loading = false
}: MemberActionsProps) {
  const userIsAdmin = isAdmin(currentUser);
  const isCurrentUser = member.id === currentUser?.id;
  const canManageUser = userIsAdmin && !isCurrentUser;

  if (!userIsAdmin) {
    return null;
  }

  return (
    <div className="flex justify-end space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(member)}
              disabled={loading}
              title="Editar"
            >
              <Edit size={16} className="text-green-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar dados do membro</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onResetPassword(member.email || "")}
              disabled={loading || !member.email}
              title={member.email_confirmed_at ? "Redefinir senha" : "Reenviar convite"}
            >
              {member.email_confirmed_at ? (
                <KeyRound size={16} className="text-blue-500" />
              ) : (
                <Mail size={16} className="text-blue-500" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{member.email_confirmed_at ? "Enviar reset de senha" : "Reenviar convite por email"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {canManageUser && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(member.id)}
                disabled={loading}
                title="Remover"
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remover membro</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
} 