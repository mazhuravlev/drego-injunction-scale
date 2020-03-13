import React, { useState, useRef } from 'react';
import './App.css';
import { dataEn, injunctionsEn } from './data';
import { Map } from 'immutable';

const answerNumbers = [...Array(9)].map((_, i) => i + 1);

interface InjunctionResult {
  name: string;
  score: number;
  type: 'operative' | 'reverse';
}

interface Result {
  injunctions: InjunctionResult[];
  threshold: number;
}

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const answers = useRef(Map<number, number>());
  const [result, setResult] = useState<Result>();

  const questions = dataEn;
  const injunctions = injunctionsEn;

  const onAnswer = (answer: number) => {
    answers.current = answers.current.set(currentQuestionIndex, answer);

    if (currentQuestionIndex === questions.length - 1) {
      setResult(calculateResult(answers.current, injunctions));
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (result !== undefined) {
    const maxScore = Math.max(...result.injunctions.map(x => x.score));
    return (
      <div className="container mx-auto py-4 px-4">
        <table className="table-auto border-collapse">
          <thead>
            <tr>
              <th>Injunction</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {result.injunctions.map(x =>
              (<React.Fragment key={x.name}>
                <tr className="border-top">
                  <td>{x.name}</td>
                  <td className="px-2">{x.type}</td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <div className="bar">
                      <div style={{ 
                        width: `${x.score / maxScore * 100}%`,
                        backgroundColor: x.score > result.threshold ? '#6f81ff' : '#72d675'
                         }}>{x.score }</div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="py-4 question">
        {currentQuestionIndex + 1}: {questions[currentQuestionIndex]}
      </div>
      <div className="inline-flex">
        {answerNumbers.map(x => <button key={x}
          className="bg-gray-300 hover:bg-gray-400 py-1 px-3 no-outline"
          onClick={() => onAnswer(x)}>{x}</button>)}
      </div>
    </div>
  );
}

export default App;

function calculateResult(answers: Map<number, number>, injunctions: string[]): Result {
  const idxs = [1, 13, 25, 37, 49];
  const r = injunctions.map((x, i) => ({
    name: x,
    score: idxs.map(x => answers.get(x - 1 + i)!).reduce(sum),
  }));
  const { length } = r;
  const mean = r.map(x => x.score).reduce(sum) / length;
  const stdev = Math.sqrt(r.map(x => x.score).map(x => Math.pow(x - mean, 2)).reduce(sum) / length);
  const threshold = mean + stdev;
  const result: Result = {
    threshold,
    injunctions: r.map(({ name, score }) => ({
      name,
      score,
      type: score > threshold ? 'operative' : 'reverse',
    })),
  };
  return result;
}

function sum(a: number, b: number) {
  return a + b;
}