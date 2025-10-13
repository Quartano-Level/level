# Configuração do Supabase

## Requisitos de Ambiente

Para que a aplicação funcione corretamente, você precisa configurar as seguintes variáveis de ambiente:

1. Crie um arquivo chamado `.env.local` na raiz do seu projeto (mesmo nível que package.json)
2. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-aqui
```

## Onde encontrar suas chaves

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Configurações do Projeto > API**
4. Você encontrará:
   - **Project URL**: Copie para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon key**: Copie para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: Copie para `SUPABASE_SERVICE_ROLE_KEY`

## Observações Importantes

- Nunca compartilhe sua `SUPABASE_SERVICE_ROLE_KEY` publicamente
- Certifique-se de que não há espaços antes ou depois dos valores
- Certifique-se de que o arquivo `.env.local` está no diretório raiz
- Após configurar as variáveis, reinicie completamente seu servidor de desenvolvimento

## Verificação

Para verificar se suas variáveis de ambiente foram carregadas corretamente, visite:
http://localhost:3000/api/env 