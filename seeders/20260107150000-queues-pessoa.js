'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Inserir fila de cadastro de pessoas
        await queryInterface.bulkInsert('sys_queues', [
            {
                name: 'pessoa-cadastro',
                description: 'Fila para cadastro de pessoas no módulo pessoa',
                controller: '@gestor/pessoa/controllers/queueController',
                method: 'processPessoaItem',
                itemsPerBatch: 10,
                maxAttempts: 3,
                retryDelay: 60,
                active: true,
                processing: false,
                lastProcessed: null,
                totalItems: 0,
                totalProcessed: 0,
                totalFailed: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], { ignoreDuplicates: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('sys_queues', {
            name: 'pessoa-cadastro'
        }, {});
    }
};


