'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Buscar país Brasil
    const [brazil] = await queryInterface.sequelize.query(
      "SELECT id as country_id FROM loc_countries WHERE abbreviation = 'BR' LIMIT 1"
    );
    
    // Buscar IDs de exemplo de cidade, estado e organização
    const [cities] = await queryInterface.sequelize.query("SELECT id FROM loc_cities LIMIT 1");
    const [states] = await queryInterface.sequelize.query("SELECT id FROM loc_states LIMIT 1");
    const [organizations] = await queryInterface.sequelize.query("SELECT id FROM sys_organizations ORDER BY id LIMIT 1");
    const [anyCountry] = await queryInterface.sequelize.query("SELECT id as country_id FROM loc_countries LIMIT 1");
    
    const cityId = cities.length > 0 ? cities[0].id : null;
    const stateId = states.length > 0 ? states[0].id : null;
    const organizationId = organizations.length > 0 ? organizations[0].id : null;
    const countryId = brazil.length > 0 ? brazil[0].country_id : (anyCountry.length > 0 ? anyCountry[0].country_id : null);
    
    await queryInterface.bulkInsert('pes_pessoas', [
      {"nome":"Exemplo 1","email":"exemplo1@teste.com","data_nascimento":"2025-12-31","cpf":"12345678901","telefone":"11999999999","endereco":"Rua Exemplo 1","id_organization":organizationId,"country_id":countryId,"city_id":cityId,"state_id":stateId,"cep":"01234567"},
      {"nome":"Exemplo 2","email":"exemplo2@teste.com","data_nascimento":"2025-12-31","cpf":"12345678902","telefone":"11999999998","endereco":"Rua Exemplo 2","id_organization":organizationId,"country_id":countryId,"city_id":cityId,"state_id":stateId,"cep":"01234568"},
      {"nome":"Exemplo 3","email":"exemplo3@teste.com","data_nascimento":"2025-12-31","cpf":"12345678903","telefone":"11999999997","endereco":"Rua Exemplo 3","id_organization":organizationId,"country_id":countryId,"city_id":cityId,"state_id":stateId,"cep":"01234569"}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pes_pessoas', null, {});
  }
};
