import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [walletBalance, setWalletBalance] = useState(undefined);
  const [isHovered, setIsHovered] = useState(false);
  const [ownerError, setOwnerError] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const atmBalance = (await atm.getBalance()).toNumber();
      setBalance(atmBalance);

      if (account) {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const wallet = provider.getSigner(account);
        const walletBalance = ethers.utils.formatEther(await wallet.getBalance());
        setWalletBalance(walletBalance);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const multiplyValue = async () => {
    if (atm) {
      try {
        const tx = await atm.multiplyBalance(2); // Replace 2 with your desired multiplier
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const transferOwnership = async (newOwner) => {
    if (atm && newOwner) {
      try {
        let tx = await atm.transferOwnership(newOwner);
        await tx.wait();
        alert(`Ownership transferred to ${newOwner}`);
      } catch (error) {
        setOwnerError(true);
        setTimeout(() => {
          setOwnerError(false);
        }, 5000);
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>ATM Balance: {balance} ETH</p>
        {walletBalance && <p>Wallet Balance: {walletBalance} ETH</p>}
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={multiplyValue}>Multiply Value by 2</button>
        <button
          onClick={() => {
            const newOwner = prompt("Enter the new owner address:");
            transferOwnership(newOwner);
          }}
        >
          Transfer Ownership
        </button>
        {ownerError && <p className="error">Error: Failed to transfer ownership</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main
      className={`container ${isHovered ? "hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <header>
        <h1>Welcome to the VIKASH'S ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: Arial, sans-serif;
          text-align: center;
          transition: background-color 0.5s;
        }

        .container.hovered {
          background-color: #5499C7;
        }

        .message {
          font-size: 18px;
          margin-bottom: 20px;
        }

        .connect-btn {
          padding: 10px 20px;
          background-color: #2ecc71;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          outline: none;
        }

        .connect-btn:hover {
          background-color: #27ae60;
        }

        .connect-btn:active {
          transform: scale(0.98);
        }

        .user-section {
          margin-top: 40px;
          transition: background-color 0.5s;
        }

        .user-section.hovered {
          background-color: #2980b9;
        }

        .account {
          font-size: 20px;
          margin-bottom: 10px;
          color: #fff;
        }

        .balance-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .balance {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #fff;
        }

        .balance-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .action-btn {
          padding: 10px 20px;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          outline: none;
        }

        .action-btn.deposit {
          background-color: #16a085;
        }

        .action-btn.withdraw {
          background-color: #c0392b;
        }

        .action-btn.multiply {
          background-color: #8e44ad;
        }

        .action-btn.transfer {
          background-color: #d35400;
        }

        .action-btn:hover {
          opacity: 0.8;
        }

        .action-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </main>
  );
}
