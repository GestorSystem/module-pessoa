'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna id_organization
    await queryInterface.addColumn('pes_pessoas', 'id_organization', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'sys_organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Criar índice para melhor performance
    await queryInterface.addIndex('pes_pessoas', ['id_organization'], {
      name: 'pes_pessoas_id_organization_idx'
    });

    // Popular id_organization com a primeira organização disponível (para dados existentes)
    const [organizations] = await queryInterface.sequelize.query(
      "SELECT id FROM sys_organizations ORDER BY id LIMIT 1"
    );
    
    if (organizations.length > 0) {
      const defaultOrgId = organizations[0].id;
      await queryInterface.sequelize.query(
        `UPDATE pes_pessoas SET id_organization = ${defaultOrgId} WHERE id_organization IS NULL`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('pes_pessoas', 'pes_pessoas_id_organization_idx');
    
    // Remover coluna
    await queryInterface.removeColumn('pes_pessoas', 'id_organization');
  }
};
