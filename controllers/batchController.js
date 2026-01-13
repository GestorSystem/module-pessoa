'use strict';

/**
 * Controller de Batch Jobs do módulo Pessoa
 * 
 * Cada método recebe um contexto e parâmetros:
 * - context: { db, token, job }
 * - parameters: Parâmetros em formato JSON passados ao método
 */
module.exports = {
  /**
   * Cadastra pessoas em lote
   * 
   * @param {Object} context - Contexto com db, token e job
   * @param {Object} parameters - Parâmetros contendo array de pessoas a serem cadastradas
   * @param {Array} parameters.pessoas - Array de objetos com dados das pessoas
   */
  async cadastrarPessoasEmLote(context, parameters) {
    const { db, token, job } = context;
    const now = new Date();

    console.log(`👤 [pessoa] Batch job de cadastro em lote executado em ${now.toISOString()}`);
    console.log(`🔑 Token de sistema gerado: ${token.substring(0, 20)}...`);

    try {
      // Verificar se há parâmetros com pessoas
      if (!parameters || !parameters.pessoas || !Array.isArray(parameters.pessoas)) {
        throw new Error('Parâmetros inválidos: é necessário um array "pessoas" com os dados das pessoas');
      }

      const pessoas = parameters.pessoas;

      if (pessoas.length === 0) {
        console.log('⚠️  Nenhuma pessoa fornecida para cadastro');
        return {
          success: true,
          message: 'Nenhuma pessoa fornecida para cadastro',
          pessoasCadastradas: 0
        };
      }

      // Buscar modelo Pessoa
      let Pessoa = db.Pessoa;

      if (!Pessoa) {
        const pessoaModelKey = Object.keys(db).find(key => 
          key.toLowerCase().includes('pessoa')
        );
        if (pessoaModelKey) {
          Pessoa = db[pessoaModelKey];
          console.log(`✅ Modelo encontrado com nome alternativo: ${pessoaModelKey}`);
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

      if (City) {
        const cities = await City.findAll({ limit: 1 });
        if (cities.length > 0) {
          cityId = cities[0].id;
          stateId = cities[0].state_id || null;
        }
      }

      // Cadastrar pessoas em lote
      const pessoasCadastradas = [];
      const erros = [];

      for (const pessoaData of pessoas) {
        try {
          const timestamp = now.getTime();
          const novaPessoa = await Pessoa.create({
            nome: pessoaData.nome || `Pessoa Batch ${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            email: pessoaData.email || `batch-${timestamp}-${Math.random().toString(36).substr(2, 9)}@example.com`,
            cpf: pessoaData.cpf || `${timestamp.toString().slice(-11).padStart(11, '0')}`,
            telefone: pessoaData.telefone || '(00) 00000-0000',
            endereco: pessoaData.endereco || 'Endereço gerado automaticamente pelo batch job',
            data_nascimento: pessoaData.data_nascimento || new Date('1990-01-01'),
            city_id: pessoaData.city_id || cityId,
            state_id: pessoaData.state_id || stateId,
            id_organization: pessoaData.id_organization || 1,
            cep: pessoaData.cep || '00000-000'
          });

          pessoasCadastradas.push({
            id: novaPessoa.id,
            nome: novaPessoa.nome,
            email: novaPessoa.email
          });

          console.log(`✅ Pessoa criada: ID ${novaPessoa.id} - ${novaPessoa.nome}`);
        } catch (error) {
          console.error(`❌ Erro ao criar pessoa:`, error);
          erros.push({
            pessoa: pessoaData,
            erro: error.message
          });
        }
      }

      console.log(`✅ Batch job concluído: ${pessoasCadastradas.length} pessoa(s) cadastrada(s), ${erros.length} erro(s)`);

      return {
        success: true,
        message: `Batch job concluído: ${pessoasCadastradas.length} pessoa(s) cadastrada(s)`,
        pessoasCadastradas: pessoasCadastradas.length,
        erros: erros.length,
        detalhes: {
          sucessos: pessoasCadastradas,
          erros: erros
        }
      };
    } catch (error) {
      console.error(`❌ Erro ao executar batch job de cadastro em lote:`, error);
      throw error;
    }
  }
};

