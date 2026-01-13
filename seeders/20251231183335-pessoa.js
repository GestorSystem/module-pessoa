'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Buscar país Brasil
    const [brazil] = await queryInterface.sequelize.query(
      "SELECT id as country_id FROM loc_countries WHERE abbreviation = 'BR' LIMIT 1"
    );
    
    // Buscar IDs de São Paulo e Rio de Janeiro
    const [spCity] = await queryInterface.sequelize.query(
      "SELECT c.id as city_id, s.id as state_id FROM loc_cities c JOIN loc_states s ON c.state_id = s.id WHERE c.name = 'São Paulo' AND s.abbreviation = 'SP' LIMIT 1"
    );
    const [rjCity] = await queryInterface.sequelize.query(
      "SELECT c.id as city_id, s.id as state_id FROM loc_cities c JOIN loc_states s ON c.state_id = s.id WHERE c.name = 'Rio de Janeiro' AND s.abbreviation = 'RJ' LIMIT 1"
    );
    
    // Se não encontrar as cidades específicas, buscar qualquer cidade/estado disponível
    const [anyCity] = await queryInterface.sequelize.query("SELECT id as city_id, state_id FROM loc_cities LIMIT 1");
    const [anyState] = await queryInterface.sequelize.query("SELECT id as state_id FROM loc_states LIMIT 1");
    const [anyCountry] = await queryInterface.sequelize.query("SELECT id as country_id FROM loc_countries LIMIT 1");
    
    // Buscar primeira organização disponível
    const [organizations] = await queryInterface.sequelize.query("SELECT id FROM sys_organizations ORDER BY id LIMIT 1");
    const organizationId = organizations.length > 0 ? organizations[0].id : null;
    
    const countryId = brazil.length > 0 ? brazil[0].country_id : (anyCountry.length > 0 ? anyCountry[0].country_id : null);
    const spCityId = spCity.length > 0 ? spCity[0].city_id : (anyCity.length > 0 ? anyCity[0].city_id : null);
    const spStateId = spCity.length > 0 ? spCity[0].state_id : (anyState.length > 0 ? anyState[0].state_id : null);
    const rjCityId = rjCity.length > 0 ? rjCity[0].city_id : (anyCity.length > 0 ? anyCity[0].city_id : null);
    const rjStateId = rjCity.length > 0 ? rjCity[0].state_id : (anyState.length > 0 ? anyState[0].state_id : null);
    
    await queryInterface.bulkInsert('pes_pessoas', [
      {"nome":"João Silva","email":"joao.silva@example.com","data_nascimento":"1990-01-01","cpf":"12345678901","telefone":"11987654321","endereco":"Rua Exemplo, 123","id_organization":organizationId,"country_id":countryId,"city_id":spCityId,"state_id":spStateId,"cep":"01234-567"},
      {"nome":"Maria Oliveira","email":"maria.oliveira@example.com","data_nascimento":"1985-05-15","cpf":"98765432100","telefone":"11912345678","endereco":"Avenida Exemplo, 456","id_organization":organizationId,"country_id":countryId,"city_id":rjCityId,"state_id":rjStateId,"cep":"98765-432"}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pes_pessoas', null, {});
  }
};
