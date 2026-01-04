# Template de Interface: Dashboard SaaS Moderno

Este documento descreve a estrutura genérica da interface (Loyout & Sidebar) utilizada na aplicação, servindo como modelo para novos módulos ou projetos similares.

## 1. Estrutura Geral (Layout)

O layout segue o padrão "Fixed Sidebar + Fluid Content":

*   **Container Principal**: Ocupa 100% da viewport (`h-screen`, `w-screen`).
*   **Background**: Gradiente sutil (Neutro) compatível com Light/Dark mode.
*   **Comportamento**: A Sidebar é fixa à esquerda; a área de conteúdo (`main`) é fluida e possui scroll independente.

## 2. Sidebar de Navegação (Menu Lateral)

A barra lateral é o componente central de navegação, com largura fixa (ex: `256px` / `w-64`) e estilo "Glassmorphism" (translucidez + blur).

### Seção A: Cabeçalho (Fixo)
*   **Posição**: Sticky Top (`top-0`).
*   **Altura**: Igual ao Header da página de conteúdo (ex: `64px` / `h-16`).
*   **Conteúdo**:
    *   **Logotipo do Produto**: Alinhado à esquerda.
    *   **Link**: Clica para retornar à Home/Dashboard.

### Seção B: Navegação Principal (Scrollável)
*   **Posição**: Flex-1 (ocupa o espaço disponível central).
*   **Comportamento**: `overflow-y-auto` (rola se houver muitos itens).
*   **Estrutura do Item de Menu**:
    *   **Ícone**: SVG (20x20px), lado esquerdo.
    *   **Label**: Texto do link.
    *   **Estado Ativo**: Background de destaque (Primary Color), texto branco, sombra suave.
    *   **Estado Inativo**: Texto cinza/neutro, hover com leve background translúcido.

### Seção C: Navegação Secundária (Fixo Inferior)
*   **Posição**: Logo acima do perfil do usuário.
*   **Conteúdo Típico**:
    *   Link para **Configurações/Ajustes**.
    *   Botão de **Logout/Sair** (cor de destaque/alerta).

### Seção D: Perfil do Usuário (Footer)
*   **Posição**: Base da Sidebar.
*   **Borda**: Separador superior sutil.
*   **Conteúdo**:
    *   **Avatar**: Iniciais do usuário ou Imagem, com background colorido.
    *   **Metadados**:
        *   Nome de Exibição (Truncado se longo).
        *   E-mail (Texto menor/secundário).
    *   **Badge de Função (Role)**: Tag visual indicando o nível de acesso (ex: Admin, Viewer), estilizada com cores semânticas.

## 3. Área de Conteúdo (Main)

*   **Padding**: Espaçamento interno consistente (ex: `p-6` ou `p-8`).
*   **Header da Página**:
    *   **Título**: H1, grande e destacado.
    *   **Subtítulo/Descrição**: Texto de apoio cinza.
    *   **Ações**: Botões de ação primária à direita (opcional).

## Exemplo de Hierarquia Visual (Wireframe)

```
+----------------+------------------------------------------------+
| [ LOGO ]       |  [ Título da Página ]            [ Ações ]     |
| (Sticky Header)|  (Descrição breve do contexto)                 |
+----------------+                                                |
|                |                                                |
| [Ícone] Item 1 |  +------------------------------------------+  |
| [Ícone] Item 2 |  |                                          |  |
| [Ícone] Item 3 |  |             ÁREA DE CONTEÚDO             |  |
| ...            |  |             (Cards, Tabelas,             |  |
| (Scrollável)   |  |              Gráficos, etc.)             |  |
|                |  |                                          |  |
|                |  +------------------------------------------+  |
|                |                                                |
+----------------+                                                |
| [Ícone] Config |                                                |
| [Ícone] Sair   |                                                |
+----------------+                                                |
| [ Avatar ]     |                                                |
| Nome do User   |                                                |
| [Role Badge]   |                                                |
+----------------+------------------------------------------------+
```
