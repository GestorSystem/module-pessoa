# Módulo Pessoa

Módulo de gerenciamento de pessoas para o sistema gestor.

## Instalação

### Como pacote npm local (desenvolvimento)

```bash
# No diretório raiz do projeto gestor
npm install file:./modules/pessoa
```

### Como pacote npm de repositório git

```bash
# Instalar de um repositório git local
npm install file:///caminho/para/repositorio/pessoa

# Ou de um repositório git remoto
npm install git+https://github.com/seu-usuario/gestor-pessoa.git
```

## Estrutura

```
pessoa/
├── models/          # Models do Sequelize
├── migrations/      # Migrations do banco de dados
├── seeders/         # Seeders de dados
├── routes/          # Rotas da API
├── controllers/     # Controllers da API
├── package.json     # Configuração do pacote npm
├── module.json      # Configuração do módulo (opcional)
└── README.md        # Este arquivo
```

## Dependências

Este módulo depende de:
- `@gestor/locations` - Módulo de localizações (cidades, estados)
- `@gestor/system` - Módulo de sistema

## Uso

Após instalar o módulo, ele será automaticamente detectado pelo sistema gestor e poderá ser instalado através da interface administrativa em `/admin/models`.

## Desenvolvimento

Para desenvolver este módulo:

1. Clone o repositório
2. Faça suas alterações
3. Commit e push para o repositório
4. No projeto principal, execute `npm install` para atualizar
