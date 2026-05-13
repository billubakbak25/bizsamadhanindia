const { prisma } = require("../lib/prisma");

function bindModel(modelName, methods) {
  return methods.reduce((accumulator, method) => {
    accumulator[method] = (...args) => prisma[modelName][method](...args);
    return accumulator;
  }, {});
}

module.exports = {
  payment: bindModel("payment", ["count", "aggregate", "findMany"]),
  service: bindModel("service", ["count"]),
};
