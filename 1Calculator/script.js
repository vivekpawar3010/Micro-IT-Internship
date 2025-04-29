// Selectors
const displayBox = document.getElementById("displayBox");
const buttons = document.querySelectorAll("button");
const operators = ["+", "-", "/", "*"];
let currentInput = "";
let previousInput = "";
let operator = null;

// Event Listeners for Buttons
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const value = e.target.innerHTML;

    if (value === "=") {
      calculateResult();
    } else if (value === "AC") {
      clearAll();
    } else if (value === "DEL") {
      deleteLast();
    } else if (operators.includes(value)) {
      handleOperator(value);
    } else if (value === "%") {
      calculatePercentage();
    } else {
      appendNumber(value);
    }
  });
});

// Handle Keyboard Input
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (!isNaN(key) || key === ".") {
    appendNumber(key);
  } else if (operators.includes(key)) {
    handleOperator(key);
  } else if (key === "Enter") {
    calculateResult();
    e.preventDefault();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "%") {
    calculatePercentage();
  }
});

// Append Number to Current Input
function appendNumber(value) {
  if (value === "." && currentInput.includes(".")) return; // Prevent multiple decimals
  if (currentInput.length >= 20) return; // Limit input length
  currentInput += value;
  updateDisplay(currentInput);
}

// Handle Operator Input
function handleOperator(value) {
  if (currentInput === "" && value === "-") {
    currentInput = "-";
    updateDisplay(currentInput);
    return;
  }

  if (currentInput === "" && previousInput === "") return; // Prevent operator without numbers

  if (previousInput !== "") {
    calculateResult();
  }

  operator = value;
  previousInput = currentInput;
  currentInput = "";
  updateDisplay(previousInput + " " + operator);
}

// Calculate Result
function calculateResult() {
  if (previousInput === "" || currentInput === "" || operator === null) return;

  const num1 = parseFloat(previousInput);
  const num2 = parseFloat(currentInput);

  let result;
  switch (operator) {
    case "+":
      result = num1 + num2;
      break;
    case "-":
      result = num1 - num2;
      break;
    case "*":
      result = num1 * num2;
      break;
    case "/":
      if (num2 === 0) {
        updateDisplay("Error (Division by Zero)");
        clearAll();
        return;
      }
      result = num1 / num2;
      break;
    default:
      return;
  }

  result = parseFloat(result.toFixed(12)); // Limit to 12 decimal places
  currentInput = result.toString();
  previousInput = "";
  operator = null;
  updateDisplay(currentInput);
}

// Delete Last Character
function deleteLast() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay(currentInput || "0");
}

// Clear All Inputs
function clearAll() {
  currentInput = "";
  previousInput = "";
  operator = null;
  updateDisplay("0");
}

// Calculate Percentage
function calculatePercentage() {
  if (currentInput === "") return;
  currentInput = (parseFloat(currentInput) / 100).toString();
  updateDisplay(currentInput);
}

// Update Display
function updateDisplay(value) {
  displayBox.value = value;
}
