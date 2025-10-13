
import { createBrowserSupabaseClient, supabaseAdmin } from "@/shared/lib/supabase";
import { User } from "@supabase/supabase-js";
import { MemberAddData, MemberUpdateData } from "../types";
import { validateMemberData, validateMemberUpdateData } from "../utils/memberUtils";

/**
 * Serviço para gerenciar operações relacionadas a membros
 */
export const memberService = {
  /**
   * Busca o usuário atual
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return user;
    } catch (error) {
      return null;
    }
  },

  /**
   * Busca a lista de membros com paginação
   */
  getMembers: async (page: number, itemsPerPage: number): Promise<{
    users: User[],
    totalPages: number
  }> => {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) throw error;
      
      const allUsers = data.users || [];
      const totalCount = allUsers.length;
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      
      // Paginação manual
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);
      
      return {
        users: paginatedUsers,
        totalPages: totalPages > 0 ? totalPages : 1
      };
    } catch (error) {
      throw new Error("Erro ao buscar membros");
    }
  },

  /**
   * Adiciona um novo membro ao sistema
   */
  addMember: async (memberData: MemberAddData, origin: string): Promise<User> => {
    try {
      // Validar dados
      const validationError = validateMemberData(memberData);
      if (validationError) {
        throw new Error(validationError);
      }

      // Verificar se o usuário já existe
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUsers?.users.some(user => user.email === memberData.email);
      
      if (userExists) {
        throw new Error("Este email já está cadastrado");
      }
      
      // Normalizar role
      const role = memberData.role === "admin" ? "admin" : "user";
      
      // Criar convite
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        memberData.email,
        {
          redirectTo: `${origin}/set-password`,
          data: {
            display_name: memberData.name,
            role: role,
            email_verified: false
          }
        }
      );
      
      if (error) throw error;
      
      return data.user;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Erro ao adicionar membro");
    }
  },

  /**
   * Remove um membro do sistema
   */
  removeMember: async (id: string): Promise<void> => {
    try {
      if (!id) throw new Error("ID do usuário é obrigatório");
      
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Erro ao remover membro");
    }
  },

  /**
   * Edita um membro existente
   */
  editMember: async (id: string, userData: MemberUpdateData): Promise<boolean> => {
    try {
      if (!id) throw new Error("ID do usuário é obrigatório");
      
      // Validar dados
      const validationError = validateMemberUpdateData(userData);
      if (validationError) {
        throw new Error(validationError);
      }

      // Buscar usuário existente
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(id);
      
      if (!existingUser?.user) {
        throw new Error("Usuário não encontrado");
      }

      // Preparar metadados atualizados
      const userMetadata: Record<string, any> = { 
        ...existingUser.user.user_metadata,
        display_name: userData.displayName
      };
      
      // Atualizar role se fornecida (apenas para mudanças de role por admin)
      if (userData.role) {
        userMetadata.role = userData.role === "admin" ? "admin" : "user";
      }
      
      // Atualizar usuário
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { 
        user_metadata: userMetadata
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Erro ao atualizar usuário");
    }
  },

  /**
   * Reenvia convite ou reseta senha de um membro
   */
  resendInviteOrResetPassword: async (email: string, origin: string): Promise<void> => {
    try {
      if (!email) throw new Error("Email é obrigatório");
      
      // Buscar usuário pelo email
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const user = existingUsers?.users.find(u => u.email === email);
      
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      
      if (user.email_confirmed_at) {
        // Usuário confirmado - enviar reset de senha
        const { error } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: `${origin}/reset-password`
          }
        });
        
        if (error) throw error;
      } else {
        // Usuário pendente - reenviar convite
        const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${origin}/set-password`
        });
        
        if (error) throw error;
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Erro ao processar solicitação");
    }
  }
}; 