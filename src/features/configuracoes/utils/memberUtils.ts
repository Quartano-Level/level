import { User } from "@supabase/supabase-js";
import { MemberAddData, MemberUpdateData } from '../types';

/**
 * Função para validar dados de um novo membro
 */
export const validateMemberData = (data: Partial<MemberAddData>): string | null => {
  if (!data.name?.trim()) {
    return "Nome é obrigatório";
  }
  
  if (!data.email?.trim()) {
    return "Email é obrigatório";
  }
  
  if (!isValidEmail(data.email)) {
    return "Email deve ter um formato válido";
  }
  
  return null;
};

/**
 * Função para validar dados de atualização de membro
 */
export const validateMemberUpdateData = (data: Partial<MemberUpdateData>): string | null => {
  if (!data.displayName?.trim()) {
    return "Nome é obrigatório";
  }
  
  return null;
};

/**
 * Função para validar formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Função para verificar se o usuário é administrador
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.user_metadata?.role === "admin";
};

/**
 * Função para obter o nome de exibição do usuário
 */
export const getDisplayName = (user: User): string => {
  return user.user_metadata?.display_name || 
        'Usuário';
};

/**
 * Função para obter o role do usuário
 */
export const getUserRole = (user: User): string => {
  return user.user_metadata?.role || 'user';
};

/**
 * Função para formatar role para exibição
 */
export const formatRole = (role: string): string => {
  switch(role) {
    case 'admin':
      return 'Administrador';
    case 'user':
      return 'Usuário';
    default:
      return role;
  }
};

/**
 * Função para verificar se um usuário está confirmado
 */
export const isUserConfirmed = (user: User): boolean => {
  return Boolean(user.email_confirmed_at);
};

/**
 * Função para obter o status do usuário
 */
export const getUserStatus = (user: User): 'confirmed' | 'pending' => {
  return isUserConfirmed(user) ? 'confirmed' : 'pending';
};

/**
 * Configurações de status para badges
 */
export const getStatusConfig = (status: 'confirmed' | 'pending') => {
  switch(status) {
    case 'confirmed':
      return { bg: "bg-green-100", text: "text-green-800", label: "Confirmado" };
    case 'pending':
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendente" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Desconhecido" };
  }
};

/**
 * Função para verificar se os dados estão vazios
 */
export const isEmptyMembers = (members: User[]): boolean => {
  return !members || members.length === 0;
};

/**
 * Função para filtrar membros por termo de busca
 */
export const filterMembers = (members: User[], searchTerm: string): User[] => {
  if (!searchTerm.trim()) return members;
  
  const term = searchTerm.toLowerCase();
  return members.filter(member => 
    getDisplayName(member).toLowerCase().includes(term) ||
    (member.email && member.email.toLowerCase().includes(term))
  );
}; 