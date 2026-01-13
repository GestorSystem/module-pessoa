'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna country_id
    await queryInterface.addColumn('pes_pessoas', 'country_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'loc_countries',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Criar índice para melhor performance
    await queryInterface.addIndex('pes_pessoas', ['country_id'], {
      name: 'pes_pessoas_country_id_idx'
    });

    // Popular country_id com o primeiro país disponível (para dados existentes)
    const [countries] = await queryInterface.sequelize.query(
      "SELECT id FROM loc_countries ORDER BY id LIMIT 1"
    );
    
    if (countries.length > 0) {
      const defaultCountryId = countries[0].id;
      await queryInterface.sequelize.query(
        `UPDATE pes_pessoas SET country_id = ${defaultCountryId} WHERE country_id IS NULL`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('pes_pessoas', 'pes_pessoas_country_id_idx');
    
    // Remover coluna
    await queryInterface.removeColumn('pes_pessoas', 'country_id');
  }
};
