'use strict';
module.exports = (sequelize, DataTypes) => {
  // Usar Model do sequelize passado como parâmetro
  // O sequelize passado deve ter acesso ao Sequelize através de sequelize.Sequelize
  // (adicionado pelo moduleLoader)
  const Model = sequelize.Sequelize.Model;
  class Pessoa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The Pessoa `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Verificar se as models existem antes de associar
      // Verificar se as associações já existem antes de criar
      // Não usar alias para evitar conflitos com associações inversas automáticas do Sequelize
      if (models.Organization && !Pessoa.associations.Organization) {
        Pessoa.belongsTo(models.Organization, { foreignKey: 'id_organization' });
      }
      if (models.Countries && !Pessoa.associations.Country) {
        Pessoa.belongsTo(models.Countries, { foreignKey: 'country_id', as: 'Country' });
      }
      if (models.Cities && !Pessoa.associations.City) {
        Pessoa.belongsTo(models.Cities, { foreignKey: 'city_id' });
      }
      if (models.States && !Pessoa.associations.State) {
        Pessoa.belongsTo(models.States, { foreignKey: 'state_id' });
      }
    }
  }
  Pessoa.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data_nascimento: DataTypes.DATEONLY,
    cpf: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefone: DataTypes.STRING,
    endereco: DataTypes.STRING,
    id_organization: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sys_organizations',
        key: 'id'
      },
      comment: 'ID da organização à qual a pessoa pertence'
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Cities',
        key: 'id'
      }
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'States',
        key: 'id'
      }
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'loc_countries',
        key: 'id'
      },
      comment: 'ID do país'
    },
    cep: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pessoa',
    tableName: 'pes_pessoas'
  });
  return Pessoa;
};
