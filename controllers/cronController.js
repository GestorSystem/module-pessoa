'use strict';

/**
 * Controller de Cron Jobs do módulo Pessoa
 * 
 * Cada método recebe um contexto com:
 * - db: Instância do banco de dados (com todos os models)
 * - token: Token JWT válido com permissões de ADMIN
 * - job: Instância do CronJob que está sendo executado
 */
module.exports = {
  /**
   * Executa a cada 10 minutos e cria uma nova pessoa de exemplo
   * @param {Object} context - Contexto com db, token e job
   */
  async runEveryTenMinutes(context) {
    const { db, token, job } = context;
    const now = new Date();

    console.log(`👤 [pessoa] Cron job a cada 10 minutos executado em ${now.toISOString()}`);
    console.log(`🔑 Token de sistema gerado: ${token.substring(0, 20)}...`);

    try {
      // Debug: listar modelos disponíveis
      const availableModels = Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key));
      console.log(`📋 Modelos disponíveis no db: ${availableModels.join(', ')}`);
      
      // Tentar diferentes variações do nome do modelo
      // O Sequelize registra o modelo usando o modelName definido no init
      let Pessoa = db.Pessoa;
      
      // Se não encontrar, tentar buscar pelo nome do arquivo ou outras variações
      if (!Pessoa) {
        // Buscar por qualquer modelo que contenha "pessoa" no nome (case insensitive)
        const pessoaModelKey = availableModels.find(key => 
          key.toLowerCase().includes('pessoa')
        );
        if (pessoaModelKey) {
          Pessoa = db[pessoaModelKey];
          console.log(`✅ Modelo encontrado com nome alternativo: ${pessoaModelKey}`);
        }
      }
      
      if (!Pessoa) {
        console.error('❌ Modelo Pessoa não encontrado. Modelos disponíveis:', availableModels);
        throw new Error(`Model Pessoa não encontrado no banco de dados. Modelos disponíveis: ${availableModels.join(', ')}`);
      }
      
      console.log(`✅ Modelo Pessoa encontrado: ${Pessoa.name || Pessoa.constructor.name || 'Pessoa'}`);

      // Buscar uma cidade e estado aleatórios para associar
      const City = db.City || db.Cities;
      const State = db.State || db.States;

      let cityId = null;
      let stateId = null;

      if (City) {
        const cities = await City.findAll({ limit: 1 });
        if (cities.length > 0) {
          cityId = cities[0].id;
          stateId = cities[0].state_id || null;
        }
      }

      // Criar uma pessoa de exemplo
      const timestamp = now.getTime();
      const novaPessoa = await Pessoa.create({
        nome: `Pessoa Cron ${timestamp}`,
        email: `cron-${timestamp}@example.com`,
        cpf: `${timestamp.toString().slice(-11).padStart(11, '0')}`,
        telefone: `(00) 00000-0000`,
        endereco: 'Endereço gerado automaticamente pelo cron job',
        data_nascimento: new Date('1990-01-01'),
        city_id: cityId,
        state_id: stateId,
        id_organization: 1,
        cep: '00000-000'
      });

      console.log(`✅ Pessoa criada com sucesso: ID ${novaPessoa.id} - ${novaPessoa.nome}`);
      console.log(`📧 Email: ${novaPessoa.email}`);
      console.log(`🔑 Token usado: ${token.substring(0, 30)}...`);

      return {
        success: true,
        message: `Pessoa criada com sucesso: ${novaPessoa.nome}`,
        pessoaId: novaPessoa.id
      };
    } catch (error) {
      console.error(`❌ Erro ao criar pessoa no cron job:`, error);
      throw error;
    }
  }
};


