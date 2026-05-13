const { prisma } = require("../lib/prisma");

function bindModel(modelName, methods) {
  return methods.reduce((accumulator, method) => {
    accumulator[method] = (...args) => prisma[modelName][method](...args);
    return accumulator;
  }, {});
}

module.exports = {
  lead: bindModel("lead", ["count", "findMany"]),
  payment: bindModel("payment", ["count", "aggregate", "findMany", "findUnique"]),
  client: bindModel("client", ["count", "findMany"]),
  service: bindModel("service", ["count"]),
  document: bindModel("document", ["count", "findMany"]),
  subscription: bindModel("subscription", ["count", "aggregate", "findMany"]),
  task: bindModel("task", ["count", "findMany"]),
  workflowInstance: bindModel("workflowInstance", ["count", "findMany"]),
  billingPlan: bindModel("billingPlan", ["count"]),
  referral: bindModel("referral", ["findMany"]),
  referralCode: bindModel("referralCode", ["findMany"]),
  addonCatalog: bindModel("addonCatalog", ["findMany"]),
  addonSuggestion: bindModel("addonSuggestion", ["count", "aggregate", "findMany"]),
  followUp: bindModel("followUp", ["count", "findMany"]),
  supportTicket: bindModel("supportTicket", ["findMany", "findUnique", "updateMany"]),
};
