const btns = [
  7,
  8,
  9,
  "DEL",
  "AC",
  4,
  5,
  6,
  "*",
  "/",
  1,
  2,
  3,
  "+",
  "-",
  0,
  "00",
  ".",
  "ANS",
  "=",
];

const btnsContainer = document.querySelector(".js-btns-container");
const resultInput = document.querySelector(".js-result");

btnsContainer.innerHTML = btns
  .map((btn) => `<button aria-label="button ${btn}">${btn}</button>`)
  .join("");

let result = "";
let savedResult = "";

btnsContainer.addEventListener("click", (e) => {
  try {
    const btnValue = e.target.textContent;
    if (btnValue === "=") {
      if (!result) {
        result = 0;
      }
      result = eval(result);
      savedResult = result;
    } else if (btnValue === "AC") {
      result = "";
    } else if (btnValue === "ANS") {
      result += savedResult;
    } else if (btnValue === "DEL") {
      result = result.slice(0, -1);
    } else {
      result += btnValue;
    }
    resultInput.value = result;
  } catch (error) {
    if (error.message === "result.slice is not a function") {
      error.message = "Press AC to exit";
    }
    return (resultInput.value = error.message);
  }
});
