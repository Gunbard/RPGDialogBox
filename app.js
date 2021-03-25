const main = () => {
  let dialogAnimationCallback = () => {      
    typewriter.start("?????:<br>This is some pretty long text dialogue. It shouldn't be this long, but you never know, I guess.");
  }; 

  let reopenOnInput = false;

  const mainDialog = document.getElementById("mainDialog");  
  const typewriter = new Typewriter(mainDialog);

  const resetAnimation = (animationName) => {
    const dialogBox = document.getElementsByClassName("animateScale")[0];
    dialogBox.style.animation = 'none';
    dialogBox.offsetHeight; // Trigger reflow
    dialogBox.style.animation = null; 
    dialogBox.style.animationName = animationName;
  };

  const openDialogBox = (text, callback) => {
    typewriter.clear();

    const hideCheckbox = document.getElementById("checkboxHide");
    if (hideCheckbox.checked) {
      hideCheckbox.click();
    }

    resetAnimation('openScale');

    dialogAnimationCallback = () => {
      if (callback) {
        callback();
      }

      if (text) {
        typewriter.start(text);
      } else {
        typewriter.reset();
      }
    }; 
  }

  const closeDialogBox = (callback) => {
    typewriter.clear();
    resetAnimation('closeScale');

    dialogAnimationCallback = () => {
      if (callback) {
        callback();
      }

      const hideCheckbox = document.getElementById("checkboxHide");
      if (!hideCheckbox.checked) {
        hideCheckbox.click();
      }
    };
  }

  mainDialog.style.width = document.getElementById("rangeWidth").value + "px";
  mainDialog.style.height = document.getElementById("rangeHeight").value + "px";
  mainDialog.style.setProperty('--dialogWidth', mainDialog.style.width);
  mainDialog.style.setProperty('--dialogHeight', mainDialog.style.height);
  mainDialog.addEventListener('animationend', (event) => {
    if (dialogAnimationCallback) {
      dialogAnimationCallback();
    }
  });

  const sizeSliders = document.getElementsByClassName("SliderSize");
  for (let slider of sizeSliders) {
    slider.oninput = (event) => {
      if (event.target.id === "rangeWidth") {
        mainDialog.style.width = event.target.value + "px";
      } else {
        mainDialog.style.height = event.target.value + "px";
      }

      mainDialog.style.setProperty('--dialogWidth', mainDialog.style.width);
      mainDialog.style.setProperty('--dialogHeight', mainDialog.style.height);
    };
  }

  const quickTextInput = document.getElementById("inputQuick");
  quickTextInput.onkeypress = (event) => {
    if (event.key === "Enter") {
      if (reopenOnInput) {
        openDialogBox(event.target.value);
      } else {
        typewriter.start(event.target.value);
      }
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
    
    if (reopenOnInput) {
      openDialogBox(newText);
    } else {
      typewriter.start(newText);
    }
  };
  
  const clearButton = document.getElementById("buttonClear");
  clearButton.onclick = () => {
    typewriter.start("");
  };  

  const openButton = document.getElementById("buttonOpen");
  openButton.onclick = () => {
    openDialogBox();
  };  

  const closeButton = document.getElementById("buttonClose");
  closeButton.onclick = () => {
    closeDialogBox();
  };  

  const hideCheckbox = document.getElementById("checkboxHide");
  hideCheckbox.onclick = (event) => {
    mainDialog.style.visibility = event.target.checked ? "hidden" : "visible";
  }

  const reopenCheckbox = document.getElementById("checkboxReopen");
  reopenCheckbox.onclick = (event) => {
    reopenOnInput = event.target.checked;
  };
  reopenOnInput = reopenCheckbox.checked;
};

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
  main();
});