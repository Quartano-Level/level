# Diretório Shared

Este diretório contém todos os componentes, hooks, tipos e utilidades compartilhados que são usados em múltiplas features da aplicação.

## Estrutura

```
shared/
├── components/        # Componentes compartilhados
│   ├── layout/        # Componentes de layout (Navbar, Footer, etc.)
│   └── ui/            # Componentes de UI reutilizáveis (Button, Card, etc.)
├── hooks/             # Hooks compartilhados entre features
├── lib/               # Configurações e utilitários de bibliotecas
├── types/             # Tipos e interfaces compartilhados
└── utils/             # Funções utilitárias (validações, formatação, etc.)
    └── supabase/      # Utilities para integração com Supabase
```

## Uso

Para usar os elementos compartilhados, importe-os da seguinte forma:

```typescript
// Importando componentes UI
import { Button, Card } from '@/shared/components/ui';

// Importando componentes de layout
import { Navbar } from '@/shared/components/layout/Navbar';

// Importando utilidades
import { validateForm } from '@/shared/utils/validations';

// Importando helpers
import { cn } from '@/shared/lib/utils';

// Importando clientes Supabase
import { createClientBrowser } from '@/shared';
```

## Diretrizes

1. **Coloque apenas código verdadeiramente compartilhado** - Se um componente é usado em apenas uma feature, ele deve ficar dentro dessa feature.

2. **Mantenha a coesão** - Componentes relacionados devem ser agrupados em diretórios com nomes significativos.

3. **Documente interfaces públicas** - Todos os componentes, hooks e utilidades compartilhados devem ter JSDoc.

4. **Evite dependências circulares** - O código compartilhado não deve depender de código específico de feature.

5. **Teste bem o código compartilhado** - Como o código compartilhado é usado em múltiplos lugares, ele precisa ter testes robustos. 