# Micro-IT Internship Projects

This repository contains two major front-end projects built using HTML, CSS, and JavaScript:

---

## 📱 Project 1: CalcPro - Advanced JavaScript Calculator

A powerful and responsive calculator that mimics the feel of a physical calculator with keyboard and touch support.

### ✨ Features

- **Full keyboard support** (0-9, +, -, \*, /, Enter, Esc)
- **Error handling** (e.g., division by zero → "Error")
- **Memory functions** (optional: MC, MR, M+, M-)
- **Responsive design** (mobile & desktop friendly)

### 🧠 Code Highlight

```javascript
function calculate(a, b, operator) {
  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b !== 0 ? a / b : "Error";
  }
}
```
