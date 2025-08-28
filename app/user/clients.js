const clients = {
  "5541984771242@s.whatsapp.net": "premium",
  "5585988888888@s.whatsapp.net": "basic",
  // quem não está aqui é considerado free
};

function getClientPlan(jid) {
  return clients[jid] || "free";
}

module.exports = {
  getClientPlan,
};
