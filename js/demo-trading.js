(() => {
  "use strict";

  const STARTING_BALANCE = 10000;
  const MAX_UNITS = 100000;
  const STORAGE_KEY = "bixberry-fx-demo-v1";

  const basePrices = {
    "EUR/USD": 1.08500,
    "GBP/USD": 1.27000,
    "USD/JPY": 149.500
  };

  let prices = { ...basePrices };
  let chart = null;
  let nextId = 1;

  function freshState() {
    return { balance: STARTING_BALANCE, positions: [], history: [] };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (
        saved &&
        Number.isFinite(saved.balance) &&
        Array.isArray(saved.positions) &&
        Array.isArray(saved.history)
      ) {
        return saved;
      }
    } catch (error) {
      console.warn("Could not load saved demo account.", error);
    }
    return freshState();
  }

  let state = loadState();

  nextId = Math.max(
    0,
    ...state.positions.map(p => Number(p.id) || 0),
    ...state.history.map(p => Number(p.id) || 0)
  ) + 1;

  const $ = id => document.getElementById(id);

  const money = value => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return safeValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  function priceFormat(pair, value) {
    return pair === "USD/JPY" ? value.toFixed(3) : value.toFixed(5);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Your browser could not save the demo account.", error);
    }
  }

  function floatingPL(position) {
    const movement = prices[position.pair] - position.entry;
    const direction = position.side === "BUY" ? 1 : -1;
    const multiplier = position.pair === "USD/JPY"
      ? 1 / prices[position.pair]
      : 1;

    return movement * position.units * direction * multiplier;
  }

  function setMessage(text, isError = false) {
    const el = $("trade-message");
    if (!el) return;
    el.textContent = text;
    el.className = isError ? "red" : "green";
  }

  function render() {
    const floating = state.positions.reduce((sum, p) => sum + floatingPL(p), 0);
    const equity = state.balance + floating;

    $("balance").textContent = money(state.balance);
    $("position-count").textContent = String(state.positions.length);
    $("unrealized").textContent = money(floating);
    $("unrealized").className = "value " + (floating >= 0 ? "green" : "red");
    $("equity").textContent = money(equity);
    $("trade-price").textContent = priceFormat($("pair").value, prices[$("pair").value]);

    const body = $("positions");

    if (!state.positions.length) {
      body.innerHTML = '<tr><td colspan="7" class="empty">No open positions. Place a demo trade to begin.</td></tr>';
    } else {
      body.replaceChildren();

      state.positions.forEach(position => {
        const pl = floatingPL(position);
        const row = document.createElement("tr");

        [
          position.pair,
          position.side,
          position.units.toLocaleString("en-US"),
          priceFormat(position.pair, position.entry),
          priceFormat(position.pair, prices[position.pair]),
          money(pl)
        ].forEach((value, index) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          if (index === 5) cell.className = pl >= 0 ? "green" : "red";
          row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => closePosition(position.id));
        actionCell.appendChild(closeButton);
        row.appendChild(actionCell);
        body.appendChild(row);
      });
    }

    const historyBody = $("history");

    if (!state.history.length) {
      historyBody.innerHTML = '<tr><td colspan="6" class="empty">Your closed demo trades will appear here.</td></tr>';
    } else {
      historyBody.replaceChildren();

      state.history.slice().reverse().slice(0, 100).forEach(trade => {
        const row = document.createElement("tr");
        const values = [
          trade.pair,
          trade.side,
          trade.units.toLocaleString("en-US"),
          priceFormat(trade.pair, trade.entry),
          priceFormat(trade.pair, trade.exit),
          money(trade.pl)
        ];

        values.forEach((value, index) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          if (index === 5) cell.className = trade.pl >= 0 ? "green" : "red";
          row.appendChild(cell);
        });

        historyBody.appendChild(row);
      });
    }

    save();
  }

  function openPosition(side) {
    const pair = $("pair").value;
    const units = Number($("units").value);

    if (!Number.isFinite(units) || units < 1 || units > MAX_UNITS) {
      setMessage("Enter a trade size between 1 and " + MAX_UNITS.toLocaleString() + " units.", true);
      return;
    }

    state.positions.push({
      id: nextId++,
      pair,
      side,
      units: Math.floor(units),
      entry: prices[pair],
      openedAt: new Date().toISOString()
    });

    setMessage(side + " demo position opened for " + pair + ".");
    render();
  }

  function closePosition(id) {
    const index = state.positions.findIndex(p => p.id === id);
    if (index < 0) return;

    const position = state.positions[index];
    const pl = floatingPL(position);

    state.balance += pl;
    state.positions.splice(index, 1);

    state.history.push({
      ...position,
      exit: prices[position.pair],
      pl,
      closedAt: new Date().toISOString()
    });

    setMessage("Position closed. Realized demo P/L: " + money(pl) + ".");
    render();
  }

  function makeChart() {
    const canvas = $("price-chart");
    if (!canvas || typeof Chart === "undefined") {
      console.warn("Chart.js could not be loaded. Demo trading remains available.");
      return;
    }

    const pair = $("chart-pair").value;
    const base = basePrices[pair];
    const labels = [];
    const data = [];
    let value = base;

    for (let i = 29; i >= 0; i--) {
      labels.push("-" + i + "m");
      value *= 1 + (Math.random() - 0.5) * 0.0015;
      data.push(Number(value.toFixed(5)));
    }

    chart?.destroy();

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: pair + " illustrative price",
          data,
          borderColor: "#8b73ff",
          backgroundColor: "rgba(139,115,255,0.12)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#f3f5ff" } } },
        scales: {
          x: { ticks: { color: "#9aa6c4", maxTicksLimit: 7 }, grid: { color: "#27314b" } },
          y: { ticks: { color: "#9aa6c4" }, grid: { color: "#27314b" } }
        }
      }
    });
  }

  $("buy-button").addEventListener("click", () => openPosition("BUY"));
  $("sell-button").addEventListener("click", () => openPosition("SELL"));

  $("pair").addEventListener("change", render);
  $("chart-pair").addEventListener("change", makeChart);

  $("reset-button").addEventListener("click", () => {
    if (!confirm("Reset your demo balance to $10,000 and erase all demo trades on this browser?")) {
      return;
    }

    state = freshState();
    prices = { ...basePrices };
    nextId = 1;
    setMessage("Demo account reset.");
    render();
    makeChart();
  });

  // Prices fluctuate only for demonstration. These are not live FX quotes.
  setInterval(() => {
    Object.keys(prices).forEach(pair => {
      const movement = (Math.random() - 0.5) * (pair === "USD/JPY" ? 0.12 : 0.0008);
      prices[pair] = Math.max(0.0001, prices[pair] + movement);
    });

    render();
  }, 5000);

  render();
  makeChart();
})();
