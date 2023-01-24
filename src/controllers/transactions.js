const { validateNumber, validateRequisition, findAccountIndex, timestamp, findAccount } = require('../constants/operators')
const database = require('../data/bancodedados')


const deposit = (req, res) => {
  validateTransactionData(res, req.body)

  const { numero_conta, valor } = req.body
  const accountIndex = findAccountIndex(numero_conta)
  if (accountIndex === -1) return res.status(404).json({ mensagem: "Conta não encontrada." })

  database.contas[accountIndex].saldo += valor;
  const now = new Date();
  let formattedNow = timestamp(now)
  const transaction = {
    data: formattedNow,
    numero_conta,
    valor
  }
  database.depositos.push(transaction)
  return res.status(204).json()
}

const withdraw = (req, res) => {
  validateTransactionData(res, req.body)

  const { numero_conta, valor } = req.body
  const accountIndex = findAccountIndex(numero_conta)
  if (accountIndex === -1) return res.status(404).json({ mensagem: "Conta não encontrada." })
  if (database.contas[accountIndex].saldo < valor) return res.status(200).json({ mensagem: "Saldo insuficiente" })

  database.contas[accountIndex].saldo -= valor;
  const now = new Date();
  let formattedNow = timestamp(now)
  const transaction = {
    data: formattedNow,
    numero_conta,
    valor
  }
  database.saques.push(transaction)
  return res.status(204).json()
}

const transfer = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

  if (!validateRequisition([numero_conta_origem, numero_conta_destino, valor, senha])) return res.status(400).json({ mensagem: "Os números da conta de origem, de destino, do valor e a senha são obrigatórios!" })
  if (!validateNumber(valor)) return res.status(400).json({ mensagem: "Você deve informar um valor válido acima de zero" })

  const indexOrigin = findAccountIndex(numero_conta_origem)
  if (indexOrigin === -1) return res.status(404).json({ mensagem: "Conta de origem não encontrada." })

  const indexDestiny = findAccountIndex(numero_conta_destino)
  if (indexDestiny === -1) return res.status(404).json({ mensagem: "Conta de destino não encontrada." })
  if (database.contas[indexOrigin].saldo < valor) return res.status(200).json({ mensagem: "Saldo insuficiente" })

  database.contas[indexOrigin].saldo -= valor
  database.contas[indexDestiny].saldo += valor
  const now = new Date();
  let formattedNow = timestamp(now)
  const transaction = {
    data: formattedNow,
    numero_conta_origem,
    numero_conta_destino,
    valor
  }
  database.transferencias.push(transaction)
  return res.status(200).json(database)
}

const validateTransactionData = (res, data) => {
  const { numero_conta, valor } = data
  if (!validateRequisition([numero_conta, valor])) return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" })
  if (!validateNumber(numero_conta)) return res.status(400).json({ mensagem: "Você deve informar um número de conta válido" })
  if (!validateNumber(valor)) return res.status(400).json({ mensagem: "Você deve informar um valor válido acima de zero" })
  return
}

module.exports = { deposit, withdraw, transfer }
