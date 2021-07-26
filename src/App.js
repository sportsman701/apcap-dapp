import { useState, useEffect, useCallback  } from 'react';
import * as ethers from 'ethers'

const App = ({ contract }) => {
  const [choiceList, setChoiceList] = useState([])
  const [choice, setChoice] = useState(1)
  const [expire, setExpire] = useState(null)
  const [secret, setSecret] = useState('')
  const [revealed, setRevealed] = useState(0)
  const [voted, setVoted] = useState(0)

  useEffect(() => {
    let timer = null

    Promise.all([
      contract.choice1(),
      contract.choice2(),
      contract.commitPhaseEndTime()
    ]).then(([choice1, choice2, endTime]) => {
      setChoiceList([choice1, choice2])
      setExpire(Math.round(endTime.toNumber() - Date.now() / 1000))

      timer = setInterval(() => {
        setExpire(prev => Math.max(prev - 1, 0))
      }, 1000)
    })

    contract.on('NewVoteCommit', voteCommit =>
      alert(`Vote committed. Commit: ${voteCommit}`)
    )
    contract.on('NewVoteReveal', (voteCommit, choice) =>
      alert(`Vote revealed. Commit: ${voteCommit} Choice: ${choice}`)
    )

    return () => timer && clearTimeout(timer)
  }, [contract])

  const handleSecretChange = useCallback(e => {
    setSecret(e.target.value)
  }, [])

  const handleChoiceChange = useCallback(e => {
    setChoice(e.target.value)
  }, [])

  const handleVoteClick = useCallback(() => {
    contract.commitVote(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${choice}+${secret}`)))
      .then(() => setVoted(prev => prev + 1))
      .catch(e => alert(e.error))
    setSecret('')
  }, [contract, secret, choice])

  const handleRevealClick = useCallback(() => {
    contract.revealVote(
      `${choice}+${secret}`,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${choice}+${secret}`))
    ).then(() => setRevealed(prev => prev + 1))
      .catch(e => alert(e.error))
    setSecret('')
  }, [contract, secret, choice])

  const handleWinnerClick = useCallback(() => {
    Promise.all([
      contract.getWinner(),
      contract.numberOfVotesCast()
    ]).then(([ winner, votes ]) =>
      alert(`Winner: ${winner}, Number of votes: ${votes}`)
    ).catch(e => alert(e.error))
  }, [contract])

  const handleSubmit = useCallback(e => e.preventDefault(), [])

  return (
    <div className="App">
      {expire === 0 ? (
        <p>Vote ended</p>
      ) : (
        <p>Vote will end in {expire} seconds</p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Secret
          <input name="secret" value={secret} onChange={handleSecretChange} />
        </label>
        
        <br/>
        <label>
          Option
          <select name="choice" onChange={handleChoiceChange}>
            <option key={0} value={1}>{choiceList[0]}</option>
            <option key={1} value={2}>{choiceList[1]}</option>
          </select>
        </label>

        <p>Voted: {voted}<br/>Revealed: {revealed}</p>
        {voted === revealed && expire === 0 && (
          <p style={{ color: 'green' }}>Now ready to get winner</p>
        )}

        <button onClick={handleVoteClick}>Vote</button>
        <button onClick={handleRevealClick}>Reveal</button>
        <button onClick={handleWinnerClick}>What is winner?</button>
      </form>
    </div>
  );
}

export default App;
