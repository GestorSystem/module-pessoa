'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar um cron job simples para o módulo pessoa, executando a cada 10 minutos
    await queryInterface.bulkInsert('sys_cron_jobs', [
      {
        name: 'pessoa-every-10-minutes',
        description: 'Exemplo de cron job do módulo pessoa executado a cada 10 minutos',
        controller: '@gestor/pessoa/controllers/cronController',
        method: 'runEveryTenMinutes',
        cronExpression: '*/10 * * * *',
        active: true,
        lastExecution: null,
        lastExecutionSuccess: null,
        lastExecutionLog: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sys_cron_jobs', {
      name: 'pessoa-every-10-minutes'
    }, {});
  }
};


