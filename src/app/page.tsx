'use client';

import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Head from 'next/head';

const symbols = ['ETHUSDT', 'SOLUSDT', 'PEPEUSDT', 'WIFUSDT'];
const baseSymbol = 'BTCUSDT';
const intervals = ['5m', '15m', '1h', '4h', '1d'];

const fetchCandlestickData = async (symbol: string, interval: string) => {
  const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  const data = await response.json();
  return data.map((candle: any) => parseFloat(candle[4])); // Close prices
};

const calculateReturns = (prices: number[]) => {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
};

const calculateBeta = (x: number[], y: number[]) => {
  const xMean = x.reduce((a, b) => a + b, 0) / x.length;
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;

  let covariance = 0;
  let variance = 0;

  for (let i = 0; i < x.length; i++) {
    covariance += (x[i] - xMean) * (y[i] - yMean);
    variance += (x[i] - xMean) ** 2;
  }

  const beta = covariance / variance;
  return beta;
};

export default function Home() {
  const [interval, setInterval] = useState('1h');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(symbols.slice(0, 1));
  const [plotData, setPlotData] = useState<any[]>([]);

  const updatePlot = async (interval: string, selectedSymbols: string[]) => {
    try {
      const btcPrices = await fetchCandlestickData(baseSymbol, interval);
      const btcReturns = calculateReturns(btcPrices);

      const traces = [];

      for (const symbol of selectedSymbols) {
        const altPrices = await fetchCandlestickData(symbol, interval);
        const altReturns = calculateReturns(altPrices);
        const beta = calculateBeta(btcReturns, altReturns);

        traces.push({
          x: btcReturns,
          y: altReturns,
          mode: 'markers',
          type: 'scatter',
          name: `${symbol} (Beta: ${beta.toFixed(2)})`,
        });
      }

      setPlotData(traces);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    updatePlot(interval, selectedSymbols);
  }, [interval, selectedSymbols]);

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Crypto Beta Dashboard</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Crypto Beta Dashboard</h1>
      <div className="mb-4">
        <label htmlFor="coinSelect" className="block text-sm font-medium text-gray-700">Choose Altcoins:</label>
        <select
          id="coinSelect"
          multiple
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedSymbols}
          onChange={(e) => {
            const options = e.target.options;
            const selected: string[] = [];
            for (let i = 0; i < options.length; i++) {
              if (options[i].selected) {
                selected.push(options[i].value);
              }
            }
            setSelectedSymbols(selected);
          }}
        >
          {symbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="intervalSelect" className="block text-sm font-medium text-gray-700">Choose Interval:</label>
        <select
          id="intervalSelect"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          {intervals.map((int) => (
            <option key={int} value={int}>
              {int}
            </option>
          ))}
        </select>
      </div>
      <Plot
        data={plotData}
        layout={{
          title: 'Crypto Beta Dashboard',
          xaxis: { title: 'BTC Returns' },
          yaxis: { title: 'Altcoin Returns' },
          showlegend: true,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}