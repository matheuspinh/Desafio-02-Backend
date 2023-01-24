const database = require('../data/bancodedados')
const { format } = require('date-fns')

const validateRequisition = (arr) => {
  if (arr.includes(undefined)) return false
  return true
}

const findAccount = (data, property1, property2) => {
  let foundData
  if (!property2) {
    foundData = database.contas.find((account) => {
      return account[property1] === data
    })
  } else if (property2) {
    foundData = database.contas.find((account) => {
      return account[property1][property2] === data
    })
  }
  return foundData
}

const hasSimilar = (arr, data, property) => {
  const filteredArray = arr.filter((account) => {
    return account.usuario[property] === data
  })
  if (filteredArray.length > 0) return true
  return false
}

const findAccountIndex = (data) => {
  const index = database.contas.findIndex((account) => {
    return account.numero === data
  })
  return index
}

const validateNumber = (data) => {
  if (isNaN(data)) return false
  if (data <= 0) return false
  return true
}

const timestamp = (data) => {
  return format(data, "yyyy-MM-dd HH:mm:ss")
}

const transactionFilter = (arr, property, data) => {
  let transactions = arr.filter((element) => {
    return element[property] === data
  })
  return transactions
}

module.exports = { validateRequisition, validateNumber, findAccount, hasSimilar, findAccountIndex, timestamp, transactionFilter }