import { renderHook, act } from '@testing-library/react'
import { useConfiguracoes } from '../hooks/useConfiguracoes'
import { memberService } from '../services/memberService'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

// Mock das dependências
jest.mock('../services/memberService')
jest.mock('sonner')
jest.mock('@/lib/supabase', () => import('./mocks/supabase'))

// Mock dos dados de teste
const mockCurrentUser: User = {
  id: 'user123',
  app_metadata: {},
  user_metadata: {
    display_name: 'Usuário Teste',
    role: 'admin',
    email_verified: true
  },
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  email: 'teste@example.com',
  role: '',
  updated_at: '2023-01-01T00:00:00.000Z',
  confirmed_at: '2023-01-01T00:00:00.000Z',
  confirmation_sent_at: '2023-01-01T00:00:00.000Z',
  email_confirmed_at: '2023-01-01T00:00:00.000Z',
  last_sign_in_at: '2023-01-01T00:00:00.000Z',
  phone: undefined,
  factors: undefined
}

const mockMembers: User[] = [
  {
    id: 'user123',
    app_metadata: {},
    user_metadata: {
      display_name: 'Usuário Teste',
      role: 'admin',
      email_verified: true
    },
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
    email: 'teste@example.com',
    role: '',
    updated_at: '2023-01-01T00:00:00.000Z',
    confirmed_at: '2023-01-01T00:00:00.000Z',
    confirmation_sent_at: '2023-01-01T00:00:00.000Z',
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T00:00:00.000Z',
    phone: undefined,
    factors: undefined
  },
  {
    id: 'user456',
    app_metadata: {},
    user_metadata: {
      display_name: 'Membro Teste',
      role: 'user',
      email_verified: true
    },
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
    email: 'membro@example.com',
    role: '',
    updated_at: '2023-01-01T00:00:00.000Z',
    confirmed_at: '2023-01-01T00:00:00.000Z',
    confirmation_sent_at: '2023-01-01T00:00:00.000Z',
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T00:00:00.000Z',
    phone: undefined,
    factors: undefined
  }
]

describe('useConfiguracoes Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup dos mocks
    jest.spyOn(memberService, 'getCurrentUser').mockResolvedValue(mockCurrentUser)
    jest.spyOn(memberService, 'getMembers').mockResolvedValue({
      users: mockMembers,
      totalPages: 1
    })
    
    // Mock do serviço de reenvio de convite/reset de senha
    jest.spyOn(memberService, 'resendInviteOrResetPassword').mockResolvedValue()
  })

  test('deve carregar o usuário atual e membros ao inicializar', async () => {
    const { result } = renderHook(() => useConfiguracoes())
    
    // Aguardar a resolução das promises
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(memberService.getCurrentUser).toHaveBeenCalled()
    expect(result.current.currentUser).toEqual(mockCurrentUser)
    expect(result.current.members).toEqual(mockMembers)
    expect(result.current.email).toBe(mockCurrentUser.email)
  })

  test('handleAddMember deve adicionar um novo membro', async () => {
    // Mock de implementação
    jest.spyOn(memberService, 'addMember').mockResolvedValue(mockMembers[1])
    
    const { result } = renderHook(() => useConfiguracoes())
    
    // Aguardar a resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Configurar o estado do formulário
    act(() => {
      result.current.setNewMemberName('Novo Membro')
      result.current.setNewMemberEmail('novo@example.com')
      result.current.setNewMemberRole('user')
    })
    
    // Chamar a função
    await act(async () => {
      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      await result.current.handleAddMember(mockEvent)
    })
    
    // Verificações
    expect(memberService.addMember).toHaveBeenCalledWith(
      {
        name: 'Novo Membro',
        email: 'novo@example.com',
        role: 'user'
      },
      expect.any(String)
    )
    expect(toast.success).toHaveBeenCalled()
    expect(result.current.newMemberName).toBe('')
    expect(result.current.newMemberEmail).toBe('')
    expect(result.current.isDialogOpen).toBe(false)
  })

  test('handleRemoveMember deve remover um membro', async () => {
    // Mock de implementação
    jest.spyOn(memberService, 'removeMember').mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useConfiguracoes())
    
    // Aguardar a resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Chamar a função
    await act(async () => {
      await result.current.handleRemoveMember('user456')
    })
    
    // Verificações
    expect(memberService.removeMember).toHaveBeenCalledWith('user456')
    expect(toast.success).toHaveBeenCalled()
    expect(memberService.getMembers).toHaveBeenCalled()
  })

  test('handleEditMember deve editar um membro', async () => {
    // Mock de implementação
    jest.spyOn(memberService, 'editMember').mockResolvedValue(true)
    
    const { result } = renderHook(() => useConfiguracoes())
    
    // Aguardar a resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Chamar a função
    await act(async () => {
      const success = await result.current.handleEditMember('user456', {
        displayName: 'Nome Atualizado',
        role: 'admin'
      })
      expect(success).toBe(true)
    })
    
    // Verificações
    expect(memberService.editMember).toHaveBeenCalledWith('user456', {
      displayName: 'Nome Atualizado',
      role: 'admin'
    })
    expect(toast.success).toHaveBeenCalled()
    expect(memberService.getMembers).toHaveBeenCalled()
  })

  test('não deve permitir operações de admin para usuários sem permissão', async () => {
    // Alterar mock para um usuário sem permissão de admin
    const nonAdminUser: User = {
      ...mockCurrentUser,
      user_metadata: {
        ...mockCurrentUser.user_metadata,
        role: 'user',
        email_verified: true
      }
    }
    
    jest.spyOn(memberService, 'getCurrentUser').mockResolvedValue(nonAdminUser)
    
    const { result } = renderHook(() => useConfiguracoes())
    
    // Aguardar a resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Tentar chamar funções de admin
    await act(async () => {
      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      await result.current.handleAddMember(mockEvent)
      await result.current.handleRemoveMember('user456')
      await result.current.handleEditMember('user456', { displayName: 'Teste' })
    })
    
    // Verificações - nenhuma função do service deve ser chamada
    expect(memberService.addMember).not.toHaveBeenCalled()
    expect(memberService.removeMember).not.toHaveBeenCalled()
    expect(memberService.editMember).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
  })
}) 