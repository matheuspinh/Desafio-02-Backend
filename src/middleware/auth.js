const bankPassword = require('../constants/bankPassword')
const database = require('../data/bancodedados')
const { findAccount } = require('../constants/operators')

const bankAuthentication = (req, res, next) => {
  const { senha_banco } = req.query
  if (senha_banco !== bankPassword) {
    return res.status(401).json("A senha do banco informada é inválida!")
  }

  next();
}

const userAuthentication = (req, res, next) => {
  let { senha, numero_conta } = req.body
  if (!numero_conta) numero_conta = req.body.numero_conta_origem
  const account = findAccount(numero_conta, "numero")
  if (!account) return res.status(404).json({ mensagem: "Conta não encontrada" })
  if (senha !== account.usuario.senha) return res.status(401).json({ mensagem: "Senha de usuário inválida" })
  next()
}

const userQueryAuthentication = (req, res, next) => {
  let { numero_conta, senha } = req.query
  const account = findAccount(numero_conta, "numero")
  if (!account) return res.status(404).json({ mensagem: "Conta não encontrada" })
  if (senha !== account.usuario.senha) return res.status(401).json({ mensagem: "Senha de usuário inválida" })
  next()
}

module.exports = { bankAuthentication, userAuthentication, userQueryAuthentication }