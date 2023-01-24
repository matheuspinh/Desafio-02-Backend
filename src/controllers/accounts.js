const database = require('../data/bancodedados')
const { validateRequisition, validateNumber, findAccount, hasSimilar, findAccountIndex, transactionFilter } = require('../constants/operators')

const listBankAccounts = (req, res) => {
  if (database.contas.length === 0) {
    res.statusMessage = `"nenhuma conta encontrada"`
    return res.status(201).json(database.contas)
  }

  res.statusMessage = `"${database.contas.length} Conta${database.contas.length !== 1 ? "s" : ""} Encontrada${database.contas.length !== 1 ? "s" : ""}."`
  return res.status(200).json(database.contas)
}

const newBankAccount = (req, res) => {
  let { nome, cpf, data_nascimento, telefone, email, senha } = req.body
  const isValid = validateRequisition([nome, cpf, data_nascimento, telefone, email, senha])
  if (!isValid) return res.sendStatus(400)

  let accountFound = findAccount(cpf, "usuario", "cpf")
  if (accountFound) return res.status(409).json({ mensagem: 'Já existe uma conta com o CPF já cadastrado' })
  accountFound = findAccount(email, "usuario", "email")
  if (accountFound) return res.status(409).json({ mensagem: 'Já existe uma conta com o email já cadastrado' })

  const newAccount = {
    numero: (database.accountId).toString(),
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha
    }
  }
  database.contas.push(newAccount)
  database.accountId++
  return res.status(201).send()
}

const updateAccountUser = (req, res) => {
  const accountNumber = req.params.numeroConta
  if (!validateNumber(accountNumber)) return res.status(400).json({ mensagem: "Informe um número de conta válido." })

  let { nome, cpf, data_nascimento, telefone, email, senha } = req.body
  const isValid = validateRequisition([nome, cpf, data_nascimento, telefone, email, senha])
  if (!isValid) return res.sendStatus(400)

  let accountIndex = findAccountIndex(accountNumber.toString())
  if (accountIndex === -1) return res.status(404).send({ mensagem: "Conta não encontrada" })

  const otherAccounts = database.contas.filter((account) => {
    return account.numero !== accountNumber.toString()
  })
  let repeatedData = hasSimilar(otherAccounts, cpf, "cpf")
  if (repeatedData) return res.status(409).json({ mensagem: 'Já existe uma conta com o CPF já cadastrado' })
  repeatedData = hasSimilar(otherAccounts, email, "email")
  if (repeatedData) return res.status(409).json({ mensagem: 'Já existe uma conta com o email já cadastrado' })

  database.contas[accountIndex].usuario = {
    ...database.contas[accountIndex].usuario,
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha
  }

  return res.sendStatus(204)
}

const deleteAccount = (req, res) => {
  const accountNumber = req.params.numeroConta

  if (!validateNumber(accountNumber)) return res.status(400).json({ mensagem: "Informe um número de conta válido." })

  let accountIndex = findAccountIndex(accountNumber.toString())
  if (accountIndex === -1) return res.status(404).send({ mensagem: "Conta não encontrada" })

  if (database.contas[accountIndex].saldo !== 0) return res.status(403).send({ mensagem: "Por favor zere o saldo da conta." })

  database.contas.splice(accountIndex, 1)
  return res.sendStatus(204)
}

const accountBalance = (req, res) => {
  let accountNumber = (req.query.numero_conta).toString()
  let account = findAccount(accountNumber, "numero")
  if (!account) return res.status(404).json({ mensagem: "Conta não encontrada." })
  return res.status(200).json({ saldo: account.saldo })
}

const accountStatement = (req, res) => {
  let accountNumber = (req.query.numero_conta).toString()
  let receivedTransfers = transactionFilter(database.transferencias, "numero_conta_destino", accountNumber)
  let sentTransfers = transactionFilter(database.transferencias, "numero_conta_origem", accountNumber)
  let deposits = transactionFilter(database.depositos, "numero_conta", accountNumber)
  let withdraws = transactionFilter(database.saques, "numero_conta", accountNumber)
  const result = {
    depositos: deposits,
    saques: withdraws,
    transferenciasEnviadas: sentTransfers,
    transferenciasRecebidas: receivedTransfers
  }
  return res.status(200).json(result)
}

module.exports = { listBankAccounts, newBankAccount, updateAccountUser, deleteAccount, accountBalance, accountStatement }