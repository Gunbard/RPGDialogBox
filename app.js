const main = () => {
  let dialogAnimationCallback = () => {      
    typewriter.start("?????:<br>This is some pretty long text dialogue. It shouldn't be this long, but you never know, I guess.");
  }; 

  let reopenOnInput = false;
  let pageOnNewlines = false;
  let closeOnLastPage = false;
  let dialogLines = [];
  let currentDialogLine = 0;

  const typewriterEventCallback = (event) => {
    const moreTextIcon = document.getElementById("moreTextIcon");
    switch (event.state) {
      case TW_STATE.TYPING: {
        moreTextIcon.style.visibility = "hidden";
        break;
      }
      case TW_STATE.STOPPED: {
        moreTextIcon.style.visibility = event.lastPage ? "hidden" : "visible";
        break;
      }
      case TW_STATE.FINISHED: {
        if (closeOnLastPage) {
          closeDialogBox();
        }
        break;
      }
      default:
    }
  };

  const dialogBox = (dialogText) => {
    currentDialogLine = 0;
    typewriter.finish();

    // Process dialog text
    dialogText = dialogText.replaceAll("<br><new>", "<new>");
    dialogLines = dialogText.split("<new>");

    if (pageOnNewlines) {
      dialogLines = dialogLines.map((dialogLine) => {
        return dialogLine.split("<br><br>");
      });
    } 

    openDialogBox(dialogLines[currentDialogLine]);
  };

  const rangeWidth = document.getElementById("rangeWidth");
  const rangeHeight = document.getElementById("rangeHeight");
  const mainDialog = document.getElementById("mainDialog");  
  const moreTextIcon = document.getElementById("moreTextIcon");
  const typewriter = new Typewriter(mainDialog, typewriterEventCallback);

  const resizeDialogBox = (width, height) => {
    if (width) {
      mainDialog.style.width = width + "px";
      mainDialog.style.setProperty("--dialogWidth", mainDialog.style.width);
    }
    
    if (height) {
      mainDialog.style.height = height + "px";
      mainDialog.style.setProperty("--dialogHeight", mainDialog.style.height);
    }
  };

  const resetAnimation = (animationName) => {
    const dialogBox = document.getElementsByClassName("animateScale")[0];
    dialogBox.style.animation = 'none';
    dialogBox.offsetHeight; // Trigger reflow
    dialogBox.style.animation = null; 
    dialogBox.style.animationName = animationName;
  };

  const openDialogBox = (text, callback, startAtLastLine) => {
    moreTextIcon.style.visibility = "hidden";
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
        typewriter.start(text, startAtLastLine);
      } else {
        typewriter.reset();
      }
    }; 
  }

  const closeDialogBox = (callback) => {
    moreTextIcon.style.visibility = "hidden";
    typewriter.clear();
    resetAnimation('closeScale');

    dialogAnimationCallback = () => {
      const hideCheckbox = document.getElementById("checkboxHide");
      if (!hideCheckbox.checked) {
        hideCheckbox.click();
      }

      if (callback) {
        callback();
      }
    };
  }

  resizeDialogBox(rangeWidth.value, rangeHeight.value);

  mainDialog.addEventListener('animationend', (event) => {
    if (dialogAnimationCallback) {
      dialogAnimationCallback();
    }
  });

  const sizeSliders = document.getElementsByClassName("SliderSize");
  for (let slider of sizeSliders) {
    slider.oninput = () => {
      resizeDialogBox(rangeWidth.value, rangeHeight.value);
    };
  }

  const quickTextInput = document.getElementById("inputQuick");
  quickTextInput.onkeypress = (event) => {
    if (event.key === "Enter") {
      if (reopenOnInput) {
        openDialogBox(event.target.value);
      } else {
        typewriter.clear();
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
    let newText = dialogInput.value.replace(/\r?\n/g, "<br>"); // Convert newlines in textarea
    dialogBox(newText);
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

  const prevButton = document.getElementById("buttonPrev");
  prevButton.onclick = () => {
    if (typewriter.isOnFirstPage()) {
      if (currentDialogLine > 0) {
        currentDialogLine -= 1;
      }
      
      openDialogBox(dialogLines[currentDialogLine], null, true);
    } else {
      typewriter.prevPage();
    }
  }
  
  const nextButton = document.getElementById("buttonNext");
  nextButton.onclick = () => {
    if (typewriter.isOnLastPage()) {
      typewriter.nextPage(); // Closes dialog box
      if (currentDialogLine < dialogLines.length - 1) {
        currentDialogLine += 1;
        closeDialogBox(() => {
          openDialogBox(dialogLines[currentDialogLine]);
        });
      } else {
        dialogLines = [];
        closeDialogBox();
      }
    } else {
      typewriter.nextPage();
    }
  }
  
  const hideCheckbox = document.getElementById("checkboxHide");
  hideCheckbox.onclick = (event) => {
    mainDialog.style.visibility = event.target.checked ? "hidden" : "visible";
  }
  mainDialog.style.visibility = hideCheckbox.checked ? "hidden" : "visible";

  const reopenCheckbox = document.getElementById("checkboxReopen");
  reopenCheckbox.onclick = (event) => {
    reopenOnInput = event.target.checked;
  };
  reopenOnInput = reopenCheckbox.checked;

  const pagingCheckbox = document.getElementById("checkboxPaging");
  pagingCheckbox.onclick = (event) => {
    pageOnNewlines = event.target.checked;
  };
  pageOnNewlines = pagingCheckbox.checked;

  const closeOnLastCheckbox = document.getElementById("checkboxCloseOnLast");
  closeOnLastCheckbox.onclick = (event) => {
    closeOnLastPage = event.target.checked;
  };
  closeOnLastPage = closeOnLastCheckbox.checked;

  const backgroundColorpicker = document.getElementById("colorBackground");
  backgroundColorpicker.onchange = (event) => {
    document.body.style.setProperty("--backgroundColor", event.target.value);
  };
  backgroundColorpicker.value = "#ADFF2F"; // GreenYellow

  const dialogBoxColorpicker = document.getElementById("colorDialogBox");
  dialogBoxColorpicker.onchange = (event) => {
    mainDialog.style.setProperty("--dialogBoxColor", event.target.value);
  };
  dialogBoxColorpicker.value = "#1E90FF"; // DodgerBlue
};

window.addEventListener("DOMContentLoaded", (event) => {
  console.log('DOM fully loaded and parsed');
  main();
});