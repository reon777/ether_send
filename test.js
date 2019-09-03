from = '0x224347c88663236AEbB57e168463C1d43F130748'
from = '0x6c701e36d985eE3dEcED7861deB020599D36433c'
from = '0.0001'
from = '2c154dd5af7f6736e22c1913db7f73761c1b38359760588d31f94d00870dbfc6'
send(from, to, amount, privateKey)

// 送金メイン
async function send(from, to, amount, privateKey) {
  // パラメータ生成
  var parameter = {}
  parameter = await _create_txjson(parameter, from, to, amount)

  // 署名
  const transaction = new Tx(parameter)
  // ここでは0xがあるとエラーになるのでsubstrで外してる
  transaction.sign(Buffer.from(privateKey.substr(2), 'hex'))

  // 送金
  _send(transaction)
}

// パラメータ生成
async function _create_txjson(parameter, from, to, amount) {
  try {
    parameter.from = from
    parameter.to = contractAddress

    var decimals = await myContract.methods.decimals().call()
    decimals = parseFloat(decimals)

    parameter.data = await myContract.methods
      .transfer(to, amount * 10 ** decimals)
      .encodeABI()

    var gasLimit = await web3.eth.estimateGas(parameter)
    // estimateGasを実行した瞬間とトランザクションを送信する瞬間で変化が起きる可能性があるので若干の余裕を持たせると安心です。
    gasLimit = gasLimit + 10000

    parameter.gasLimit = web3.utils.toHex(gasLimit)

    var gasPrice = await web3.eth.getGasPrice()
    gasPrice = parseInt(gasPrice) + 3000000000

    parameter.gasPrice = web3.utils.toHex(gasPrice)
    const count = await web3.eth.getTransactionCount(from)
    // この場合、nonceはgetTransactionCountの値をそのまま入れれば良いですが、実際はトランザクション毎にインクリメントする必要がある値ですから、トランザクションを複数生成する際はその点注意が必要です。
    // 具体的には、複数のトランザクションを作成して、その後にsendするようなケースの場合に、nonceのインクリメントを忘れていて同一の値になっていると1つ目以降のトランザクションはエラーになってしまいます。
    parameter.nonce = count

    return parameter
  } catch (error) {
    console.log('error.name: ' + error.name)
    console.log('error.message: ' + error.message)
  }
}

// 送金
function _send(transaction) {
  var response = null
  // ここでは0xが必要
  web3.eth
    .sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
    .once('transactionHash', hash => {
      console.info('transactionHash', 'https://etherscan.io/tx/' + hash)
      response = hash
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
