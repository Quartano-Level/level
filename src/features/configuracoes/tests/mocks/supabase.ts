import { User } from "@supabase/supabase-js";

// Importação dos mockMembers
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
];

// Mock do cliente Supabase para testes
export const createBrowserSupabaseClient = jest.fn().mockReturnValue({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { 
        user: mockMembers[0]
      },
      error: null
    })
  }
});

// Mock do supabaseAdmin para testes
export const supabaseAdmin = {
  auth: {
    admin: {
      listUsers: jest.fn().mockResolvedValue({
        data: {
          users: mockMembers,
          aud: "authenticated",
          total_count: 2,
          next_page: null,
          last_page: 1
        },
        error: null
      }),
      getUserById: jest.fn().mockImplementation((id) => {
        const user = mockMembers.find(u => u.id === id);
        return Promise.resolve({
          data: { user },
          error: user ? null : new Error('User not found')
        });
      }),
      updateUserById: jest.fn().mockResolvedValue({
        data: {},
        error: null
      }),
      deleteUser: jest.fn().mockResolvedValue({
        error: null
      }),
      inviteUserByEmail: jest.fn().mockResolvedValue({
        data: { 
          user: { 
            id: 'new-user-123', 
            email: 'novo@example.com',
            user_metadata: {
              display_name: 'Novo Usuário',
              role: 'user',
              email_verified: false
            }
          } 
        },
        error: null
      })
    },
    resetPasswordForEmail: jest.fn().mockResolvedValue({
      error: null
    })
  }
}; 