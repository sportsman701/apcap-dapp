import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as ethers from 'ethers';
import reportWebVitals from './reportWebVitals';
import dotenv from 'dotenv'
import commitRevealJson from './abi/CommitReveal.json'
import './index.css';

dotenv.config()

const getContract = async () => {
  const provider = new ethers.providers.JsonRpcProvider()

  const signer = provider.getSigner(0)

  const factory = new ethers.ContractFactory(
    commitRevealJson.abi,
    commitRevealJson.bytecode,
    signer
  )

  const { address } = await factory.deploy(
    ethers.BigNumber.from(process.env.REACT_APP_PERIOD),
    process.env.REACT_APP_CHOICE1,
    process.env.REACT_APP_CHOICE2
  )

  const contract = new ethers.Contract(address, commitRevealJson.abi, provider)
  return await contract.connect(signer)
}

getContract().then(contract =>
  ReactDOM.render(
    <React.StrictMode>
      <App contract={contract} />
    </React.StrictMode>,
    document.getElementById('root')
  )
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
