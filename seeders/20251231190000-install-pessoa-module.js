'use strict';

/**
 * Seeder de instalação do módulo Pessoa
 * 
 * Este seeder funciona como script de instalação do módulo, criando:
 * - Funções de permissão (pes.visualizar_pessoas, pes.manter_pessoas, pes.excluir_pessoas)
 * - CRUD dinâmico para Pessoas
 * - Item de menu para acessar a interface
 * 
 * Para executar manualmente:
 * npx sequelize-cli db:seed --seed 20251231190000-install-pessoa-module.js
 * 
 * Ou importar e chamar a função installPessoaModule() diretamente:
 * const installModule = require('./seeders/20251231190000-install-pessoa-module');
 * await installModule.installPessoaModule();
*/
// Lazy load db usando resolveGestorModule do moduleLoader
function getDb() {
  const path = require('path');
  const fs = require('fs');
  
  let moduleLoader = null;
  
  // Estratégia 1: Tentar usar require.resolve (funciona se o módulo estiver instalado via npm)
  try {
    const moduleLoaderPath = require.resolve('@gestor/system/utils/moduleLoader');
    moduleLoader = require(moduleLoaderPath);
    console.log(`✅ moduleLoader carregado via require.resolve: ${moduleLoaderPath}`);
  } catch (e) {
    // Estratégia 2: Procurar recursivamente a partir do diretório atual
    let currentPath = __dirname;
    const maxDepth = 15;
    
    for (let i = 0; i < maxDepth; i++) {
      // Tentar encontrar node_modules/@gestor/system/utils/moduleLoader
      const testPath = path.join(currentPath, 'node_modules', '@gestor', 'system', 'utils', 'moduleLoader.js');
      if (fs.existsSync(testPath)) {
        try {
          moduleLoader = require(testPath);
          console.log(`✅ moduleLoader carregado de: ${testPath}`);
          break;
        } catch (e2) {
          // Continuar procurando
        }
      }
      
      // Tentar encontrar frontend/node_modules/@gestor/system/utils/moduleLoader
      const frontendPath = path.join(currentPath, 'frontend', 'node_modules', '@gestor', 'system', 'utils', 'moduleLoader.js');
      if (fs.existsSync(frontendPath)) {
        try {
          moduleLoader = require(frontendPath);
          console.log(`✅ moduleLoader carregado de: ${frontendPath}`);
          break;
        } catch (e2) {
          // Continuar procurando
        }
      }
      
      // Tentar encontrar mod/system/utils/moduleLoader (para desenvolvimento local)
      const modPath = path.join(currentPath, 'mod', 'system', 'utils', 'moduleLoader.js');
      if (fs.existsSync(modPath)) {
        try {
          moduleLoader = require(modPath);
          console.log(`✅ moduleLoader carregado de: ${modPath}`);
          break;
        } catch (e2) {
          // Continuar procurando
        }
      }
      
      // Subir um nível
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) break;
      currentPath = parentPath;
    }
  }
  
  if (!moduleLoader) {
    // Estratégia 3: Tentar caminhos relativos fixos (fallback)
    const possibleModuleLoaderPaths = [
      path.resolve(__dirname, '../../../node_modules/@gestor/system/utils/moduleLoader'),
      path.resolve(__dirname, '../../../../node_modules/@gestor/system/utils/moduleLoader'),
      path.resolve(__dirname, '../../../../../node_modules/@gestor/system/utils/moduleLoader'),
      path.resolve(__dirname, '../../../../../../node_modules/@gestor/system/utils/moduleLoader'),
      path.resolve(__dirname, '../../../../../../../node_modules/@gestor/system/utils/moduleLoader'),
      path.resolve(__dirname, '../../system/utils/moduleLoader'),
      path.resolve(__dirname, '../../../system/utils/moduleLoader'),
    ];
    
    for (const moduleLoaderPath of possibleModuleLoaderPaths) {
      if (fs.existsSync(moduleLoaderPath + '.js')) {
        try {
          moduleLoader = require(moduleLoaderPath);
          console.log(`✅ moduleLoader carregado de: ${moduleLoaderPath}`);
          break;
        } catch (e) {
          // Continuar tentando outros caminhos
        }
      }
    }
  }
  
  if (!moduleLoader) {
    throw new Error(`Não foi possível carregar moduleLoader. Certifique-se de que @gestor/system está instalado em node_modules/@gestor/system. Diretório atual: ${__dirname}`);
  }
  
  // Usar resolveGestorModule para resolver o caminho do modelsLoader
  try {
    const modelsLoaderPath = moduleLoader.resolveGestorModule('@gestor/system/utils/modelsLoader');
    console.log(`✅ modelsLoaderPath resolvido: ${modelsLoaderPath}`);
    const modelsLoader = require(modelsLoaderPath);
    return modelsLoader.loadModels();
  } catch (error) {
    throw new Error(`Erro ao carregar modelsLoader: ${error.message}. Stack: ${error.stack}`);
  }
}

const db = getDb();
const { Op } = db.Sequelize;

// Função para instalar o módulo (exportada para uso externo)
async function installPessoaModule(queryInterface, Sequelize) {
  try {
    console.log('🚀 Iniciando instalação do módulo Pessoa...');
    
    // 1. Buscar ou criar sistema Manager (assumindo que é o sistema principal)
    const System = db.System;
    let managerSystem = await System.findOne({ where: { sigla: 'MANAGER' } });
    
    if (!managerSystem) {
      // Se não encontrar, buscar pelo primeiro sistema disponível
      managerSystem = await System.findOne({ order: [['id', 'ASC']] });
    }
    
    if (!managerSystem) {
      throw new Error('Sistema não encontrado. Certifique-se de que o sistema Manager está instalado.');
    }
    
    const systemId = managerSystem.id;
    console.log(`✅ Sistema encontrado: ${managerSystem.name} (ID: ${systemId})`);
    
    // 2. Criar funções do módulo
    const Function = db.Function;
    const functions = [
      { name: 'pes.visualizar_pessoas', title: 'Visualizar Pessoas' },
      { name: 'pes.manter_pessoas', title: 'Manter Pessoas' },
      { name: 'pes.excluir_pessoas', title: 'Excluir Pessoas' }
    ];
    
    const createdFunctions = [];
    for (const func of functions) {
      const [functionRecord, created] = await Function.findOrCreate({
        where: { name: func.name },
        defaults: { name: func.name, title: func.title }
      });
      createdFunctions.push(functionRecord);
      console.log(`${created ? '✅ Criada' : 'ℹ️  Já existe'} função: ${func.name}`);
    }
    
    // 3. Criar CRUD para Pessoas
    const Crud = db.Crud;
    const crudConfig = {
      title: 'Pessoas',
      icon: 'people',
      resource: 'Pessoa',
      endpoint: '/api/pessoas',
      rowKey: 'id',
      createRoute: '/crud/pessoas/new',
      editRoute: '/crud/pessoas/:id',
      deleteMessage: 'Deseja realmente excluir a pessoa "${row.nome}"?',
      deleteSuccessMessage: 'Pessoa excluída com sucesso!',
      columns: [
        {
          name: 'nome',
          required: true,
          label: 'Nome',
          align: 'left',
          field: 'nome',
          sortable: true,
          style: 'min-width: 200px'
        },
        {
          name: 'cpf',
          label: 'CPF',
          align: 'left',
          field: 'cpf',
          sortable: true,
          style: 'min-width: 120px'
        },
        {
          name: 'email',
          required: true,
          label: 'E-mail',
          align: 'left',
          field: 'email',
          sortable: true,
          style: 'min-width: 200px'
        },
        {
          name: 'telefone',
          label: 'Telefone',
          align: 'left',
          field: 'telefone',
          sortable: true,
          style: 'min-width: 130px'
        },
        {
          name: 'city',
          label: 'Cidade',
          align: 'left',
          field: 'City.name',
          sortable: true,
          style: 'min-width: 150px'
        },
        {
          name: 'state',
          label: 'Estado',
          align: 'left',
          field: 'State.name',
          sortable: true,
          style: 'min-width: 100px'
        }
      ],
      layouts: [
        {
          title: 'Informações Pessoais',
          rows: [
            {
              cols: [
                {
                  width: '50%',
                  fields: [
                    { name: 'nome', label: 'Nome Completo' }
                  ]
                },
                {
                  width: '50%',
                  fields: [
                    { name: 'cpf', label: 'CPF' }
                  ]
                }
              ]
            },
            {
              cols: [
                {
                  width: '50%',
                  fields: [
                    { name: 'email', label: 'E-mail', type: 'email' }
                  ]
                },
                {
                  width: '50%',
                  fields: [
                    { name: 'data_nascimento', label: 'Data de Nascimento', type: 'date' }
                  ]
                }
              ]
            },
            {
              cols: [
                {
                  width: '50%',
                  fields: [
                    { name: 'telefone', label: 'Telefone' }
                  ]
                },
                {
                  width: '50%',
                  fields: [
                    { name: 'cep' }
                  ]
                }
              ]
            }
          ]
        },
        {
          title: 'Endereço',
          rows: [
            {
              cols: [
                {
                  width: '100%',
                  fields: [
                    { name: 'endereco' }
                  ]
                }
              ]
            }
          ]
        }
      ],
      fields: [
        {
          name: 'nome',
          label: 'Nome Completo',
          type: 'text',
          rules: ['val => !!val || "Nome é obrigatório"'],
          hint: 'Digite o nome completo da pessoa'
        },
        {
          name: 'cpf',
          label: 'CPF',
          type: 'text',
          rules: [
            'val => !!val || "CPF é obrigatório"',
            'val => /^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$|^\\d{11}$/.test(val) || "CPF inválido"'
          ],
          mask: '###.###.###-##',
          hint: 'Digite apenas números ou no formato 000.000.000-00'
        },
        {
          name: 'email',
          label: 'E-mail',
          type: 'email',
          rules: [
            'val => !!val || "E-mail é obrigatório"',
            'val => /.+@.+\\..+/.test(val) || "E-mail inválido"'
          ],
          hint: 'Digite um e-mail válido'
        },
        {
          name: 'data_nascimento',
          label: 'Data de Nascimento',
          type: 'date',
          hint: 'Selecione a data de nascimento'
        },
        {
          name: 'telefone',
          label: 'Telefone',
          type: 'text',
          mask: '(##) #####-####',
          hint: 'Digite o telefone com DDD'
        },
        {
          name: 'endereco',
          label: 'Endereço',
          type: 'text',
          hint: 'Digite o endereço completo (rua, número, complemento)'
        },
        {
          name: 'country_id',
          label: 'País',
          type: 'select',
          optionsEndpoint: '/api/countries',
          optionLabel: 'name',
          optionValue: 'id',
          rules: [],
          hint: 'Selecione o país'
        },
        {
          name: 'state_id',
          label: 'Estado',
          type: 'select',
          optionsEndpoint: '/api/states',
          optionLabel: 'name',
          optionValue: 'id',
          rules: [],
          hint: 'Selecione o estado (após escolher o país)'
        },
        {
          name: 'city_id',
          label: 'Cidade',
          type: 'select',
          optionsEndpoint: '/api/cities',
          optionLabel: 'name',
          optionValue: 'id',
          rules: [],
          hint: 'Selecione a cidade (após escolher o estado)'
        },
        {
          name: 'cep',
          label: 'CEP',
          type: 'text',
          mask: '#####-###',
          hint: 'Digite o CEP no formato 00000-000'
        }
      ],
          relations: [
            {
              type: 'select',
              modelName: 'countries',
              label: 'País',
              endpoint: '/api/countries',
              field: 'Country',
              itemLabel: 'name',
              itemValue: 'id',
              payloadField: 'country_id',
              as: 'Country',
              clearable: true
            },
            {
              type: 'select',
              modelName: 'states',
              label: 'Estado',
              endpoint: '/api/states',
              field: 'State',
              itemLabel: 'name',
              itemValue: 'id',
              payloadField: 'state_id',
              as: 'State',
              dependsOn: 'country_id', // Indica que esta relação depende do campo country_id
              filterParam: 'country_id', // Nome do parâmetro de filtro na API
              clearable: true
            },
            {
              type: 'select',
              modelName: 'cities',
              label: 'Cidade',
              endpoint: '/api/cities',
              field: 'City',
              itemLabel: 'name',
              itemValue: 'id',
              payloadField: 'city_id',
              as: 'City',
              dependsOn: 'state_id', // Indica que esta relação depende do campo state_id
              filterParam: 'state_id', // Nome do parâmetro de filtro na API
              clearable: true
            }
          ]
        };
    
    const [crud, crudCreated] = await Crud.findOrCreate({
      where: { resource: 'Pessoa' },
      defaults: {
        name: 'pessoas',
        title: 'Pessoas',
        icon: 'people',
        resource: 'Pessoa',
        endpoint: '/api/pessoas',
        config: crudConfig,
        active: true,
        isSystem: false
      }
    });
    
    if (crudCreated) {
      console.log('✅ CRUD criado: Pessoas');
    } else {
      // Atualizar CRUD existente
      await crud.update({
        config: crudConfig,
        active: true
      });
      console.log('✅ CRUD atualizado: Pessoas');
    }
    
    // 4. Buscar menu "Administração" no sistema Manager (menu padrão)
    // const Menu = db.Menu;
    // let adminMenu = await Menu.findOne({
    //   where: {
    //     name: 'Administração',
    //     id_system: systemId
    //   }
    // });
    
    // if (!adminMenu) {
    //   // Se não encontrar Administração, buscar qualquer menu do sistema
    //   adminMenu = await Menu.findOne({
    //     where: { id_system: systemId },
    //     order: [['id', 'ASC']]
    //   });
    // }
    
    // if (!adminMenu) {
    //   throw new Error('Menu não encontrado. Certifique-se de que os menus do sistema estão instalados.');
    // }

    const [menus] = await queryInterface.sequelize.query(
      "SELECT MAX(id) as maxId FROM sys_menus"
    );
    const nextMenuId = (menus[0]?.maxId || 0) + 1;

    // 2. Criar Menu "Localizações"
    await queryInterface.bulkInsert('sys_menus', [
      {
        id: nextMenuId,
        name: 'Pessoas',
        id_system: 1,
        id_organization: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
    
    // console.log(`✅ Menu encontrado: ${adminMenu.name} (ID: ${adminMenu.id})`);
    
    // 5. Criar item de menu para Pessoas
    const MenuItem = db.MenuItems;
    const maxOrder = await MenuItem.max('order', {
      where: { id_menu: nextMenuId }
    }) || 0;
    
    const [menuItem, menuItemCreated] = await MenuItem.findOrCreate({
      where: {
        name: 'Pessoas',
        id_menu: nextMenuId,
        id_system: systemId,
        route: '/crud/pessoas'
      },
      defaults: {
        name: 'Pessoas',
        icon: 'people',
        route: '/crud/pessoas',
        target_blank: false,
        id_menu: nextMenuId,
        id_system: systemId,
        id_organization: null,
        id_role: null,
        order: maxOrder + 1
      }
    });
    
    if (menuItemCreated) {
      console.log('✅ Item de menu criado: Pessoas');
    } else {
      // Atualizar ordem se já existir
      await menuItem.update({ order: maxOrder + 1 });
      console.log('ℹ️  Item de menu já existe: Pessoas (ordem atualizada)');
    }
    
    console.log('✅ Instalação do módulo Pessoa concluída com sucesso!');
    console.log('');
    console.log('📋 Resumo:');
    console.log(`   - ${createdFunctions.length} função(ões) criada(s)/verificada(s)`);
    console.log(`   - CRUD "${crud.title}" criado/atualizado`);
    console.log(`   - Item de menu "Pessoas" criado/verificado`);
    console.log('');
    console.log('🌐 Interface disponível em: /crud/pessoas');
    
    return {
      success: true,
      functions: createdFunctions,
      crud: crud,
      menu: nextMenuId,
      menuItem: menuItem
    };
    
  } catch (error) {
    console.error('❌ Erro ao instalar módulo Pessoa:', error);
    throw error;
  }
}
 
/** @type {import('sequelize-cli').Migration}  */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Executar instalação
    await installPessoaModule(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    // Lazy load db
    const modelsLoaderPath = resolveSystemModule('@gestor/system/utils/modelsLoader');
    const modelsLoader = require(modelsLoaderPath);
    const db = modelsLoader.loadModels();
    
    console.log('🔄 Desinstalando módulo Pessoa...');
    
    try {
      // Remover item de menu
      const MenuItem = db.MenuItems;
      await MenuItem.destroy({
        where: { route: '/crud/pessoas' }
      });
      console.log('✅ Item de menu removido');
      
      // Desativar CRUD (não remover, apenas desativar)
      const Crud = db.Crud;
      await Crud.update(
        { active: false },
        { where: { resource: 'Pessoa' } }
      );
      console.log('✅ CRUD desativado');
      
      // Remover funções (opcional - você pode querer manter para histórico)
      const Function = db.Function;
      await Function.destroy({
        where: {
          name: {
            [Op.in]: [
              'pes.visualizar_pessoas',
              'pes.manter_pessoas',
              'pes.excluir_pessoas'
            ]
          }
        }
      });
      console.log('✅ Funções removidas');
      
      console.log('✅ Desinstalação concluída');
    } catch (error) {
      console.error('❌ Erro ao desinstalar módulo Pessoa:', error);
      throw error;
    }
  },
  
  // Exportar função para uso externo
  installPessoaModule
};
