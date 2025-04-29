# CalcPro - Advanced JavaScript Calculator


## Features
- **Full keyboard support** (0-9, +, -, *, /, Enter, Esc)
- **Error handling** (e.g., division by zero → "Error")
- **Memory functions** (Optional: Add MC, MR, M+, M- buttons)
- **Responsive design** (Works on mobile/desktop)

## Code Highlight
```javascript
// Example of your calculation logic
function calculate(a, b, operator) {
  switch (operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : "Error";
  }
}
