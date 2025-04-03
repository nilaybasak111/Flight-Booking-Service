const { StatusCodes } = require("http-status-codes");

const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  // Create
  async create(data) {
    const response = await this.model.create(data);
    return response;
  }

  // Get
  async get(data) {
    const response = await this.model.findByPk(data);
    if(!response){
      throw new AppError("Not Able to Find the Resource", StatusCodes.NOT_FOUND)
    }
    return response;
  }

  // Get All
  async getall() {
    const response = await this.model.findAll();
    return response;
  }

  // Delete
  async destroy(data) {
    const response = await this.model.destroy({
      where: {
        id: data,
      },
    });
    if(!response){
      throw new AppError("Not Able to Find the Airplane", StatusCodes.NOT_FOUND)
    }
    return response;
  }

  // Update
  async update(id, data) {
    // data --> Data must be an Object --> {col: value, .......}
    const response = await this.model.update(data, {
      where: {
        id: id,
      },
    });
    return response;
  }
}

module.exports = CrudRepository;