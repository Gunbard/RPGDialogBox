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

  const dialogInput = document.getElementById("dialogInput");
  
  const resetButton = document.getElementById("buttonReset");
  resetButton.onclick = () => {
    typewriter.reset();
  };  

  const updateButton = document.getElementById("buttonUpdate");
  updateButton.onclick = () => {
    const newText = dialogInput.value.replace(/\r?\n/g, '<br>'); // Convert newlines in textarea
    if (newText.length > 0) {
      typewriter.start(newText);
    }
  };

  typewriter.start("?????:<br>This is some pretty long text dialogue. It shouldn't be this long, but you never know, I guess.");
};

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
  main();
});