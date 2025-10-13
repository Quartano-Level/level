// Componentes principais
export { ConfiguracoesPage } from './components/ConfiguracoesPage';
export { MembrosSection } from './components/MembrosSection';
export { UserProfileCard } from './components/UserProfileCard';

// Subcomponentes
export { MemberActions } from './components/MemberActions';
export { MemberStatusBadge } from './components/MemberStatusBadge';
export { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
export { AddMemberDialog } from './components/AddMemberDialog';

// Hooks
export { useConfiguracoes } from './hooks/useConfiguracoes';

// Serviços
export { memberService } from './services/memberService';

// Tipos
export type { 
  Member, 
  MemberUpdateData, 
  MemberAddData, 
  MemberState, 
  MemberFormState 
} from './types';

// Utilitários
export * from './utils/memberUtils'; 