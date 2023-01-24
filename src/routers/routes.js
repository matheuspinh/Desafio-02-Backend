const express = require('express')
const auth = require('../middleware/auth')
const { listBankAccounts, newBankAccount, updateAccountUser, deleteAccount, accountBalance, accountStatement } = require('../controllers/accounts')
const { deposit, withdraw, transfer } = require('../controllers/transactions')
const router = express()

router.get('/contas', auth.bankAuthentication, listBankAccounts)
router.post('/contas', newBankAccount)
router.put('/contas/:numeroConta/usuario', updateAccountUser)
router.delete('/contas/:numeroConta', deleteAccount)
router.get('/contas/saldo', auth.userQueryAuthentication, accountBalance)
router.get('/contas/extrato', auth.userQueryAuthentication, accountStatement)
router.post('/transacoes/depositar', deposit)
router.post('/transacoes/sacar', auth.userAuthentication, withdraw)
router.post('/transacoes/transferir', auth.userAuthentication, transfer)

module.exports = router