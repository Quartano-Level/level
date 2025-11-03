'use client'

import { FormEvent, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { memberService } from "../services/memberService";
import { MemberAddData, MemberUpdateData } from "../types";
import { validateMemberData, validateMemberUpdateData, isAdmin } from "../utils/memberUtils";

/**
 * Hook para gerenciar a página de configurações
 */
export function useConfiguracoes() {
  // Estado do usuário e email
  const [email, setEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estado do formulário de adição de membros
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("user");
  
  // Estado de loading
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Estado dos membros
  const [members, setMembers] = useState<User[]>([]);
  
  // Estado de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(7);

  /**
   * Busca o usuário atual
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const user = await memberService.getCurrentUser();
      
      if (user) {
        setCurrentUser(user);
        setEmail(user.email || "");
      }
    } catch (error) {
      // Erro silencioso - não precisa notificar o usuário
    }
  }, []);

  /**
   * Busca membros com paginação
   */
  const fetchMembers = useCallback(async (page: number = 1) => {
    try {
      setLoadingMembers(true);
      
      const { users, totalPages: calculatedTotalPages } = await memberService.getMembers(page, itemsPerPage);
      
      // Ajustar página atual se necessário
      let adjustedPage = page;
      if (page > calculatedTotalPages && calculatedTotalPages > 0) {
        adjustedPage = calculatedTotalPages;
        setCurrentPage(adjustedPage);
      }
      
      setMembers(users);
      setTotalPages(calculatedTotalPages);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao buscar membros");
    } finally {
      setLoadingMembers(false);
    }
  }, [itemsPerPage]);

  /**
   * Reseta o formulário de adição de membro
   */
  const resetForm = useCallback(() => {
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberRole("user");
    setIsDialogOpen(false);
  }, []);

  /**
   * Adiciona um novo membro
   */
  const handleAddMember = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Validar dados do formulário
    const memberData: MemberAddData = {
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole
    };
    
    const validationError = validateMemberData(memberData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Verificar permissões
    if (!isAdmin(currentUser)) {
      toast.error("Apenas administradores podem adicionar novos membros.");
      return;
    }

    try {
      setLoading(true);
      
      await memberService.addMember(memberData, window.location.origin);
      
      toast.success(`Convite enviado com sucesso para ${newMemberEmail}`);
      
      resetForm();
      await fetchMembers(currentPage);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao adicionar membro");
    } finally {
      setLoading(false);
    }
  }, [newMemberName, newMemberEmail, newMemberRole, currentUser, currentPage, fetchMembers, resetForm]);

  /**
   * Remove um membro
   */
  const handleRemoveMember = useCallback(async (id: string) => {
    if (!id) return;
    
    if (!isAdmin(currentUser)) {
      toast.error("Apenas administradores podem remover membros.");
      return;
    }
    
    try {
      setLoading(true);
      
      await memberService.removeMember(id);
      
      // Atualizar lista localmente primeiro para UX mais rápida
      setMembers(prev => prev.filter(member => member.id !== id));
      
      toast.success("Membro removido com sucesso!");
      
      // Recarregar para manter consistência
      await fetchMembers(currentPage);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover membro");
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentPage, fetchMembers]);

  /**
   * Edita um membro existente
   */
  const handleEditMember = useCallback(async (id: string, userData: MemberUpdateData): Promise<boolean> => {
    if (!id) return false;
    
    // Validar dados
    const validationError = validateMemberUpdateData(userData);
    if (validationError) {
      toast.error(validationError);
      return false;
    }
    
    // Verificar permissões (admin ou o próprio usuário)
    const isCurrentUser = id === currentUser?.id;
    if (!isAdmin(currentUser) && !isCurrentUser) {
      toast.error("Você não tem permissão para editar este membro.");
      return false;
    }
    
    try {
      setLoading(true);
      
      const success = await memberService.editMember(id, userData);
      
      if (success) {
        toast.success("Usuário atualizado com sucesso!");
        await fetchMembers(currentPage);
        return true;
      }
      
      return false;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar usuário");
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentPage, fetchMembers]);

  /**
   * Reenvia convite ou reseta senha de um membro
   */
  const handleResendInviteOrResetPassword = useCallback(async (email: string) => {
    if (!email) return;
    
    // Verificar permissões (admin ou o próprio usuário)
    const isCurrentUserEmail = email === currentUser?.email;
    if (!isAdmin(currentUser) && !isCurrentUserEmail) {
      toast.error("Você não tem permissão para esta ação.");
      return;
    }
    
    try {
      setLoading(true);
      
      await memberService.resendInviteOrResetPassword(email, window.location.origin);
      
      // Determinar mensagem baseada no status do usuário
      const user = members.find(u => u.email === email);
      const message = user?.email_confirmed_at ? 
        "Email para redefinição de senha enviado com sucesso!" : 
        "Convite reenviado com sucesso!";
      
      toast.success(message);
      await fetchMembers(currentPage);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  }, [currentUser, members, currentPage, fetchMembers]);

  /**
   * Buscar dados iniciais ao carregar a página
   */
  useEffect(() => {
    fetchMembers(currentPage);
    fetchCurrentUser();
  }, [currentPage]); // Removido fetchMembers e fetchCurrentUser das dependências
  // As funções são estáveis (fetchMembers depende apenas de itemsPerPage constante,
  // fetchCurrentUser não tem dependências), então é seguro removê-las

  return {
    // Estado do usuário e email
    email,
    currentUser,
    
    // Estado do formulário
    isDialogOpen,
    setIsDialogOpen,
    newMemberName,
    setNewMemberName,
    newMemberEmail,
    setNewMemberEmail,
    newMemberRole,
    setNewMemberRole,
    
    // Estado de loading
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
  };
} 