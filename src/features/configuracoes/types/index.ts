import { User } from "@supabase/supabase-js";

// Usando type alias em vez de interface vazia
export type Member = User;

export interface MemberUpdateData {
  displayName: string;
  role?: string;
}

export interface MemberAddData {
  name: string;
  email: string;
  role: string;
}

export interface MemberState {
  members: User[];
  currentUser: User | null;
  loading: boolean;
  loadingMembers: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface MemberFormState {
  isDialogOpen: boolean;
  newMemberName: string;
  newMemberEmail: string;
  newMemberRole: string;
} 