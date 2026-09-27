const buttonLayout = [
  [7, 8, 9, "DEL", "AC"],
  [4, 5, 6, "*", "/"],
  [1, 2, 3, "+", "-"],
  [0, "00", ".", "ANS", "="],
];

const calculator = {
  display: "0",
  storedValue: "0",
  previousValue: null,
  operator: null,
  waitingForNewValue: false,
};

const specialKeys = {
  Enter: "=",
  Escape: "AC",
  Backspace: "DEL",
  Delete: "DEL",
};

function formatDisplay(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Error";
  }

  if (Number.isInteger(number)) {
    return String(number);
  }

  return Number(number.toFixed(10)).toString();
}

function resetCalculator(state = calculator) {
  state.display = "0";
  state.storedValue = "0";
  state.previousValue = null;
  state.operator = null;
  state.waitingForNewValue = false;
  return state.display;
}

function applyOperator(inputOperator, state = calculator) {
  const currentValue = Number(state.display);

  if (
    state.operator &&
    state.previousValue !== null &&
    !state.waitingForNewValue
  ) {
    const left = Number(state.previousValue);
    let result = 0;

    switch (state.operator) {
      case "+":
        result = left + currentValue;
        break;
      case "-":
        result = left - currentValue;
        break;
      case "*":
        result = left * currentValue;
        break;
      case "/":
        if (currentValue === 0) {
          state.display = "Error";
          state.previousValue = null;
          state.operator = null;
          state.waitingForNewValue = false;
          return state.display;
        }
        result = left / currentValue;
        break;
      default:
        return state.display;
    }

    state.display = formatDisplay(result);
    state.storedValue = state.display;
  }

  state.previousValue = Number(state.display);
  state.operator = inputOperator;
  state.waitingForNewValue = true;
  return state.display;
}

function handleAction(action, state = calculator) {
  switch (action) {
    case "AC":
      return resetCalculator(state);

    case "DEL": {
      if (state.display === "Error") {
        state.display = "0";
        state.waitingForNewValue = false;
        state.previousValue = null;
        state.operator = null;
        return state.display;
      }

      state.display =
        state.display.length > 1 ? state.display.slice(0, -1) : "0";
      state.waitingForNewValue = false;
      return state.display;
    }

    case "ANS": {
      if (state.storedValue !== "0" || state.display === "0") {
        state.display = state.storedValue;
      }
      state.waitingForNewValue = false;
      return state.display;
    }

    case "=": {
      if (
        state.operator &&
        state.previousValue !== null &&
        !state.waitingForNewValue
      ) {
        const left = Number(state.previousValue);
        const right = Number(state.display);
        let result = 0;

        switch (state.operator) {
          case "+":
            result = left + right;
            break;
          case "-":
            result = left - right;
            break;
          case "*":
            result = left * right;
            break;
          case "/":
            if (right === 0) {
              state.display = "Error";
              state.previousValue = null;
              state.operator = null;
              state.waitingForNewValue = false;
              return state.display;
            }
            result = left / right;
            break;
          default:
            return state.display;
        }

        state.display = formatDisplay(result);
        state.storedValue = state.display;
      }

      state.previousValue = null;
      state.operator = null;
      state.waitingForNewValue = true;
      return state.display;
    }

    default:
      return state.display;
  }
}

function handleInput(input, state = calculator) {
  if (input === null || input === undefined || input === "") {
    return state.display;
  }

  const normalizedValue = String(input).trim();

  if (Object.prototype.hasOwnProperty.call(specialKeys, normalizedValue)) {
    return handleInput(specialKeys[normalizedValue], state);
  }

  if (/^\d$/.test(normalizedValue)) {
    if (state.display === "Error") {
      state.display = "0";
    }

    if (state.waitingForNewValue) {
      state.display = normalizedValue;
      state.waitingForNewValue = false;
      return state.display;
    }

    state.display =
      state.display === "0"
        ? normalizedValue
        : `${state.display}${normalizedValue}`;
    return state.display;
  }

  if (normalizedValue === "00") {
    if (state.display === "Error") {
      state.display = "0";
    }

    if (state.waitingForNewValue) {
      state.display = "00";
      state.waitingForNewValue = false;
      return state.display;
    }

    state.display = state.display === "0" ? "0" : `${state.display}00`;
    return state.display;
  }

  if (normalizedValue === ".") {
    if (state.display === "Error") {
      state.display = "0.";
      state.waitingForNewValue = false;
      return state.display;
    }

    if (state.waitingForNewValue) {
      state.display = "0.";
      state.waitingForNewValue = false;
      return state.display;
    }

    if (!state.display.includes(".")) {
      state.display = `${state.display}.`;
    }

    return state.display;
  }

  switch (normalizedValue) {
    case "AC":
    case "DEL":
    case "ANS":
    case "=":
      return handleAction(normalizedValue, state);

    case "+":
    case "-":
    case "*":
    case "/":
      return applyOperator(normalizedValue, state);

    default:
      return state.display;
  }
}

if (typeof document !== "undefined") {
  const btnsContainer = document.querySelector(".js-btns-container");
  const resultInput = document.querySelector(".js-result");

  if (btnsContainer && resultInput) {
    btnsContainer.innerHTML = buttonLayout
      .flat()
      .map((btn) => {
        const value = String(btn);
        const type = ["+", "-", "*", "/"].includes(value)
          ? "operator"
          : value === "="
            ? "equals"
            : ["AC", "DEL", "ANS"].includes(value)
              ? "action"
              : "number";

        return `<button type="button" data-value="${value}" data-type="${type}" aria-label="button ${value}">${value}</button>`;
      })
      .join("");

    const render = () => {
      resultInput.value = calculator.display;
    };

    render();

    btnsContainer.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) {
        return;
      }

      handleInput(button.dataset.value, calculator);
      render();
    });

    window.addEventListener("keydown", (event) => {
      const key = event.key;

      if (Object.prototype.hasOwnProperty.call(specialKeys, key)) {
        event.preventDefault();
        handleInput(specialKeys[key], calculator);
      } else if (
        /[0-9]/.test(key) ||
        ["+", "-", "*", "/", "."].includes(key) ||
        key === "00"
      ) {
        event.preventDefault();
        handleInput(key === "00" ? "00" : key, calculator);
      } else if (key === "=" || key === "Enter") {
        event.preventDefault();
        handleInput("=", calculator);
      }

      render();
    });
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    calculator,
    formatDisplay,
    handleInput,
    handleAction,
    applyOperator,
    resetCalculator,
  };
}
