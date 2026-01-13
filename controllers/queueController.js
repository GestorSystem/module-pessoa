'use strict';

/**
 * Controller de Queue do módulo Pessoa
 * 
 * Este controller processa itens da fila de cadastro de pessoas
 * 
 * Cada método recebe um contexto:
 * - context: { db, token, queue, item }
 * - data: Dados do item em formato JSON
 */
module.exports = {
  /**
   * Processa um item da fila de cadastro de pessoas
   * 
   * @param {Object} context - Contexto com db, token, queue e item
   * @param {Object} data - Dados da pessoa a ser cadastrada
   */
  async processPessoaItem(context, data) {
    const { db, token, queue, item } = context;
    const now = new Date();

    console.log(`👤 [pessoa] Processando item da fila de pessoas:`, data);

    try {
      // Validar dados
      if (!data || (!data.nome && !data.email)) {
        throw new Error('Dados inválidos: é necessário pelo menos nome ou email');
      }

      // Buscar modelo Pessoa
      let Pessoa = db.Pessoa;

      if (!Pessoa) {
        const pessoaModelKey = Object.keys(db).find(key => 
          key.toLowerCase().includes('pessoa')
        );
        if (pessoaModelKey) {
          Pessoa = db[pessoaModelKey];
        }
      }

      if (!Pessoa) {
        throw new Error('Model Pessoa não encontrado no banco de dados');
      }

      // Buscar uma cidade e estado aleatórios para associar (se necessário)
      const City = db.City || db.Cities;
      const State = db.State || db.States;

      let cityId = null;
      let stateId = null;

      if (City && !data.city_id) {
        const cities = await City.findAll({ limit: 1 });
        if (cities.length > 0) {
          cityId = cities[0].id;
          stateId = cities[0].state_id || null;
        }
      }

      // Criar pessoa
      const timestamp = now.getTime();
      const novaPessoa = await Pessoa.create({
        nome: data.nome || `Pessoa Queue ${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        email: data.email || `queue-${timestamp}-${Math.random().toString(36).substr(2, 9)}@example.com`,
        cpf: data.cpf || `${timestamp.toString().slice(-11).padStart(11, '0')}`,
        telefone: data.telefone || '(00) 00000-0000',
        endereco: data.endereco || 'Endereço gerado automaticamente pela fila',
        data_nascimento: data.data_nascimento || new Date('1990-01-01'),
        city_id: data.city_id || cityId,
        state_id: data.state_id || stateId,
        id_organization: data.id_organization || 1,
        cep: data.cep || '00000-000'
      });

      console.log(`✅ Pessoa criada com sucesso: ID ${novaPessoa.id} - ${novaPessoa.nome}`);

      return {
        success: true,
        message: `Pessoa "${novaPessoa.nome}" cadastrada com sucesso`,
        pessoaId: novaPessoa.id,
        pessoa: {
          id: novaPessoa.id,
          nome: novaPessoa.nome,
          email: novaPessoa.email
        }
      };
    } catch (error) {
      console.error(`❌ Erro ao processar item da fila de pessoas:`, error);
      throw error;
    }
  }
};

