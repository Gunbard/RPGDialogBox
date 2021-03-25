const main = () => {
  const mainDialog = document.getElementById("mainDialog");  
  const typewriter = new Typewriter(mainDialog);

  mainDialog.style.width = document.getElementById("rangeWidth").value + "px";
  mainDialog.style.height = document.getElementById("rangeHeight").value + "px";

  const sizeSliders = document.getElementsByClassName("SliderSize");
  for (let slider of sizeSliders) {
    slider.oninput = (event) => {
      if (event.target.id === "rangeWidth") {
        mainDialog.style.width = event.target.value + "px";
      } else {
        mainDialog.style.height = event.target.value + "px";
      }
    };
  }

  const quickTextInput = document.getElementById("inputQuick");
  quickTextInput.onkeypress = (event) => {
    if (event.key === "Enter") {
      typewriter.start(event.target.value);
      event.target.value = ""; // Clear input
    }
  };

  const dialogInput = document.getElementById("dialogInput");
  
  const resetButton = document.getElementById("buttonReset");
  resetButton.onclick = () => {
    typewriter.reset();
  };  

  const updateButton = document.getElementById("buttonUpdate");
  updateButton.onclick = () => {
    const newText = dialogInput.value.replace(/\r?\n/g, '<br>'); // Convert newlines in textarea
    typewriter.start(newText);
  };
  
  const clearButton = document.getElementById("buttonClear");
  clearButton.onclick = () => {
    typewriter.start("");
  };  

  const hideCheckbox = document.getElementById("checkboxHide");
  hideCheckbox.onclick = (event) => {
    mainDialog.style.visibility = event.target.checked ? "hidden" : "visible";
  }

  typewriter.start("?????:<br>This is some pretty long text dialogue. It shouldn't be this long, but you never know, I guess.");
};

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
  main();
});