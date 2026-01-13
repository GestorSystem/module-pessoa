'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se as tabelas de locations existem
    const [tables] = await queryInterface.sequelize.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('loc_cities', 'loc_states')"
    );
    const tableNames = tables.map(t => t.TABLE_NAME);
    const hasCities = tableNames.includes('loc_cities');
    const hasStates = tableNames.includes('loc_states');
    
    if (!hasCities || !hasStates) {
      console.warn('⚠️  Tabelas de locations não encontradas. A migration será executada, mas as foreign keys podem falhar se o módulo locations não estiver instalado.');
    }
    
    // Verificar se a tabela pes_pessoas existe e se tem as colunas antigas
    const tableDescription = await queryInterface.describeTable('pes_pessoas');
    const hasOldColumns = tableDescription.cidade || tableDescription.estado;
    
    // Remover colunas antigas cidade e estado (se existirem)
    if (tableDescription.cidade) {
      await queryInterface.removeColumn('pes_pessoas', 'cidade');
    }
    if (tableDescription.estado) {
      await queryInterface.removeColumn('pes_pessoas', 'estado');
    }
    
    // Adicionar colunas com foreign keys (apenas se as tabelas existirem)
    if (hasCities) {
      await queryInterface.addColumn('pes_pessoas', 'city_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'loc_cities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } else {
      // Se não existir, criar como INTEGER simples sem foreign key
      await queryInterface.addColumn('pes_pessoas', 'city_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
    
    if (hasStates) {
      await queryInterface.addColumn('pes_pessoas', 'state_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'loc_states',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } else {
      // Se não existir, criar como INTEGER simples sem foreign key
      await queryInterface.addColumn('pes_pessoas', 'state_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover foreign keys e colunas
    await queryInterface.removeColumn('pes_pessoas', 'city_id');
    await queryInterface.removeColumn('pes_pessoas', 'state_id');
    
    // Restaurar colunas antigas como STRING
    await queryInterface.addColumn('pes_pessoas', 'cidade', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('pes_pessoas', 'estado', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};

