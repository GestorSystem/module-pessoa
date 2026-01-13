'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Inserir batch job de cadastro de pessoas em lote
        await queryInterface.bulkInsert('sys_batch_jobs', [
            {
                name: 'pessoa-cadastro-lote',
                description: 'Batch job que cadastra pessoas em lote no módulo pessoa',
                controller: '@gestor/pessoa/controllers/batchController',
                method: 'cadastrarPessoasEmLote',
                cronExpression: '*/2 * * * *',
                parameters: JSON.stringify({
                    pessoas: [
                        {
                            nome: 'João Silva',
                            email: 'joao.silva@example.com',
                            cpf: '12345678901',
                            telefone: '(11) 98765-4321',
                            endereco: 'Rua Exemplo, 123',
                            data_nascimento: '1985-05-15',
                            id_organization: 1
                        },
                        {
                            nome: 'Maria Santos',
                            email: 'maria.santos@example.com',
                            cpf: '98765432109',
                            telefone: '(11) 91234-5678',
                            endereco: 'Avenida Teste, 456',
                            data_nascimento: '1990-08-20',
                            id_organization: 1
                        }
                    ]
                }),
                active: true,
                lastExecution: null,
                lastExecutionSuccess: null,
                lastExecutionLog: null,
                totalExecutions: 0,
                totalSuccess: 0,
                totalErrors: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], { ignoreDuplicates: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('sys_batch_jobs', {
            name: 'pessoa-cadastro-lote'
        }, {});
    }
};

