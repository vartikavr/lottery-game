import "./App.css";
import web3 from './web3/web3';
import lottery from './web3/lottery';
import { useState, useEffect } from 'react';
import FlashMessage from 'react-flash-message';

function App() {
  const [manager, setManager] = useState('');
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState('');
  const [balance, setBalance] = useState('');
  const [amount, setAmount] = useState('');
  const [isPendingEnter, setEnterPending] = useState(false);
  const [errorAmount, setErrorAmount] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [isPendingWinner, setWinnerPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isManager, setIsManager] = useState(true);

  useEffect(async () => {
    const managerAddress = await lottery.methods.manager().call();
    //here while "calling"(not "sending") the function we don't need to specify "from", as we did previously
    //because metamask by default is connected to one of our accounts
    setManager(managerAddress);

    const allPlayers = await lottery.methods.getPlayers().call();
    setPlayers(allPlayers);

    const currBalance = await web3.eth.getBalance(lottery.options.address);
    setBalance(currBalance);
  }, []);


  const enterLottery = async e => {
    //console.log("entered..")
    e.preventDefault();
    try {
      if (amount >= 0.011) {
        setErrorAmount(false);
        setIsEntered(false);
        const accounts = await web3.eth.getAccounts();

        setEnterPending(true);

        await lottery.methods.enter().send({
          from: accounts[0],
          value: web3.utils.toWei(amount, 'ether')
        });

        setEnterPending(false);
        setIsEntered(true);
        setAmount('');
        updateLotteryData();
      }
      else {
        setErrorAmount(true);
      }
    }
    catch (err) {
      setIsEntered(false);
    }
  };

  const pickWinner = async () => {
    //console.log("picking..");
    const accounts = await web3.eth.getAccounts();
    try {
      if (accounts[0].toLowerCase() === manager.toLowerCase()) {
        setIsManager(true);
        setIsSuccess(false);
        setWinnerPending(true);
        await lottery.methods.pickWinner().send({
          from: accounts[0]
        });
        const winnerAddress = await lottery.methods.winner().call();
        setWinner(winnerAddress);
        setWinnerPending(false);
        setIsSuccess(true);
        updateLotteryData();
      }
      else {
        setIsManager(false);
      }
    }
    catch (err) {
      console.log("error", err)
      setIsSuccess(false);
    }
  }

  const updateLotteryData = async () => {
    const managerAddress = await lottery.methods.manager().call();
    setManager(managerAddress);

    const allPlayers = await lottery.methods.getPlayers().call();
    setPlayers(allPlayers);

    const currBalance = await web3.eth.getBalance(lottery.options.address);
    setBalance(currBalance);
  }

  return (
    <div className="App col-md-6 offset-md-3 text-center">
      <h1 className="heading mt-3"> Lottery Contract </h1>
      <p>
        This contract is managed by : {manager}.<br />
        There are currently {players.length} people entered, competing to win {web3.utils.fromWei(balance)} ether!
      </p>
      <hr />
      <form onSubmit={enterLottery}>
        <h4 className="mb-3">Want to try your luck?</h4>
        <div className="col-sm-6 offset-sm-2 form-group d-flex flex-nowrap">
          <label className="col-sm-3 form-label"><b>Ether :</b></label>
          <input type="text" className="col-sm-3 form-control" placeholder="Enter amount" value={amount}
            onChange={event => setAmount(event.target.value)}
          />
        </div>
        <button className="btn btn-success mt-2">
          Enter
        </button>
      </form>
      {isPendingEnter &&
        <div className="waitMessage mt-2">
          Waiting for the transaction to succeed ...
        </div>
      }
      {isEntered &&
        <div className="entryMessage mt-2">
          Congrats! You've entered the Lottery!
        </div>
      }
      {errorAmount &&
        <div className="flashError">
          <FlashMessage duration={5000}>
            <p>Minimum 0.011 ETH required to enter.</p>
          </FlashMessage>
        </div>
      }
      <hr />
      <h4>Ready to pick a winner?</h4>
      <button className="btn btn-primary mt-2" onClick={pickWinner}>
        Pick a Winner
      </button>
      {!isManager &&
        <div className="flashError">
          <FlashMessage duration={5000}>
            <p>This action requires Manager priviledges.</p>
          </FlashMessage>
        </div>
      }
      {isPendingWinner &&
        <div className="waitForWinner mt-2">
          Waiting for the transaction to succeed ...
        </div>
      }
      {isSuccess &&
        <div className="successMessage mt-2">
          A winner has been picked!<br />
          Player {winner} won! Congratulations!
        </div>
      }
    </div>
  );
}

export default App;
