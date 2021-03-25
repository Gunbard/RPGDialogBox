const LINE_END_PADDING = 16;

class Typewriter {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.currentCharIndex = 0;
    this.charDelay = 30; // Milliseconds
    this.originalText = "";
    this.fullText = this.originalText;
    this.text = "";
    this.lineOffset = 0;

    this.widthTestCanvas = document.createElement("canvas");
    this.calculateTextWidth = this.calculateTextWidth.bind(this);
    this.start = this.start.bind(this);
    this.update = this.update.bind(this);
    this.reset = this.reset.bind(this);
    this.stop = this.stop.bind(this);
  } 

  calculateTextWidth(text) {
    const containerStyle = window.getComputedStyle(this.container);
    let context = this.widthTestCanvas.getContext("2d");
    context.font = containerStyle.fontSize + ' ' + containerStyle.fontFamily;
    let metrics = context.measureText(text);
    return metrics.width;
  }

  start(text) {
    text = text || "";
    this.currentCharIndex = 0;
    this.lineOffset = 0;
    this.originalText = text;
    this.fullText = text;
    this.text = "";
    
    this.stop();
    this.interval = setInterval(this.update, this.charDelay);
  }

  update() {
    if (this.currentCharIndex < this.fullText.length) {
      let skipChars = 0;
      this.currentCharIndex += 1;

      const currentChar = this.fullText.charAt(this.currentCharIndex);
      if (currentChar === '<') {
        // Scan-ahead to detect linebreak tags
        while (this.fullText.charAt(this.currentCharIndex + skipChars) != '>') {
          skipChars += 1;
        }
        this.lineOffset = this.currentCharIndex += skipChars + 1;
      } else if (currentChar === ' ') {
        // If on a whitespace character, perform scan-ahead to determine if next word will fit on line
        
        // Get next word starting from the next character until another space is found or the end of the text
        while (this.fullText.charAt(this.currentCharIndex + skipChars + 1) != ' ' && 
               this.currentCharIndex + skipChars < this.fullText.length) {
          skipChars += 1;
        }
        // Test including the next word to see if it fits
        let textWidth = this.calculateTextWidth(this.fullText.substring(this.lineOffset, this.currentCharIndex + skipChars));
        const containerWidth = this.container.style.width.split('px')[0];
        if (textWidth >= parseInt(containerWidth) - LINE_END_PADDING) {
          // Insert a <br> tag and skip those chars
          this.fullText = 
            this.fullText.substring(0, this.currentCharIndex) + '<br>' + this.fullText.substr(this.currentCharIndex);
          this.lineOffset = this.currentCharIndex += 4 + 1;
        }
      }


      this.text = this.fullText.substring(0, this.currentCharIndex);
    } else {
      this.stop();
    }

    this.container.innerHTML = this.text;
  }

  reset() {
    this.stop();
    this.currentCharIndex = 0;
    this.lineOffset = 0;
    this.start(this.originalText);
  }

  stop() {
    clearInterval(this.interval);
    console.log("Typing stopped.");
  }
}