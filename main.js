function sign_ethereum(nonce, gasPrice, gasLimit, to, value, data, privateKey) {
  var rawTx = {}

  rawTx['nonce'] = nonce
  rawTx['gasPrice'] = '0x' + gasPrice.toString(16)
  rawTx['gasLimit'] = '0x' + gasLimit.toString(16)
  rawTx['to'] = to
  value = value * 10 ** 18
  rawTx['value'] = '0x' + value.toString(16)
  rawTx['data'] = data
  console.log(rawTx)

  var tx = new ethereumjs.Tx(rawTx)

  // Buffer.Buffer はタイポでないです
  var pk = new ethereumjs.Buffer.Buffer(privateKey, 'hex')

  tx.sign(pk)

  return '0x' + tx.serialize().toString('hex')
}

// 送金
function send(web3js, sign) {
  web3js.eth
    .sendSignedTransaction(sign)
    .once('transactionHash', hash => {
      console.info('transactionHash', 'https://etherscan.io/tx/' + hash)
    })
    .once('receipt', receipt => {
      console.info('receipt', receipt)
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      console.info('confirmation', confirmationNumber, receipt)
    })
    .on('error', error => {
      console.log('error' + error)
    })
}
