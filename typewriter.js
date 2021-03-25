/**
 * Typewriter Text
 * Author: Gunbard 
 * Usage: const someTypewriter = new Typewriter(someHTMLElementContainer);
 *        someTypewriter.start("Some text to show.");
 **/

// Arbitrary padding at the end of a line to ensure full words are sent to the 
// next line if they don't fit
const TW_LINE_END_PADDING = 16; // Pixels

// Timeout delay for typing the chars. Lower = faster.
const TW_CHAR_DELAY = 30; // Milliseconds

class Typewriter {
  /**
   * @constructor
   * @param container {HTML DOM Element} The DOM element to dump text into via innerHTML 
   **/
  constructor(container) {
    this.container = container;
    
    // The current index for the cursor
    this.currentCharIndex = 0;

    // Unmodified version of the full text. Used for resetting.
    this.originalText = "";

    // Modifiable/working-copy version of the text to be displayed.
    this.fullText = this.originalText;

    // The actual text that will display
    this.text = "";

    // Index offset for the current line being written. Used for text width checking.
    this.lineOffset = 0;

    // Array of paged text (todo)
    this.lines = [];

    // Instance of a canvas element. Used for text width calculation.
    this.widthTestCanvas = document.createElement("canvas");

    // Method bindings
    this.calculateTextSize = this.calculateTextSize.bind(this);
    this.start = this.start.bind(this);
    this.clear = this.clear.bind(this);
    this.update = this.update.bind(this);
    this.reset = this.reset.bind(this);
    this.stop = this.stop.bind(this);
  } 

  /**
   * Uses a canvas to calculate the dimensions of a string using the container's font.
   * @param text {String} The string to calculate.
   * @returns {Object} The metrics of the text. 
   **/
  calculateTextSize(text) {
    const containerStyle = window.getComputedStyle(this.container);
    let context = this.widthTestCanvas.getContext("2d");
    context.font = containerStyle.fontSize + ' ' + containerStyle.fontFamily;
    let metrics = context.measureText(text);
    return metrics;
  }

  /**
   * Begins typing text into the container.
   * @param text {String} The text to show.
   **/
  start(text) {
    text = text || "";
    this.currentCharIndex = 0;
    this.lineOffset = 0;
    this.originalText = text;
    this.fullText = text;
    this.text = "";
    
    this.stop();
    this.interval = setInterval(this.update, TW_CHAR_DELAY);
  }

  /**
   * Updates the displayed text. Consumers should not call this directly. 
   **/
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
        // If on a whitespace character, perform scan-ahead to determine if next word will fit on line.
        // Get next word starting from the next character until another space/linebreak is found or the end of the text
        while (this.fullText.charAt(this.currentCharIndex + skipChars + 1) != ' ' && 
               this.fullText.charAt(this.currentCharIndex + skipChars + 1) != '<' &&       
               this.currentCharIndex + skipChars < this.fullText.length) {
          skipChars += 1;
        }
        // Test including the next word to see if it fits
        let textWidth = this.calculateTextSize(
          this.fullText.substring(this.lineOffset, this.currentCharIndex + skipChars + 1)).width;
        const containerWidth = this.container.clientWidth;
        if (textWidth >= parseInt(containerWidth) - TW_LINE_END_PADDING) {
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

  /**
   * Removes any text from the container immediately.
   **/
  clear() {
    this.container.innerHTML = "";
    this.stop();
  }

  /**
   * Restarts typing 
   **/
  reset() {
    this.stop();
    this.currentCharIndex = 0;
    this.lineOffset = 0;
    this.start(this.originalText);
  }

  /**
   * Stops typing
   **/
  stop() {
    clearInterval(this.interval);
    console.log("Typing stopped.");
  }
}