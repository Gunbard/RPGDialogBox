/**
 * Typewriter Text
 * Author: Gunbard 
 * Usage: const someTypewriter = new Typewriter(someHTMLElementContainer);
 *        someTypewriter.start("Some text to show.");
 *        someTypewriter.start(["What did you say?", "How are you<br>doing?", "Whatever."]);
 **/

// Arbitrary padding at the end of a line to ensure full words are sent to the 
// next line if they don't fit
const TW_LINE_END_PADDING = 8; // Pixels

// Timeout delay for typing the chars. Lower = faster.
const TW_CHAR_DELAY = 30; // Milliseconds

// Enum for typewriter state
const TW_STATE = {
  TYPING: 0,
  STOPPED: 1,
  FINISHED: 2
};

class Typewriter {
  /**
   * @constructor
   * @param container {HTML DOM Element} The DOM element to dump text into via innerHTML 
   **/
  constructor(container, eventCallback) {
    this.container = container;
    
    // Current state
    this.state = TW_STATE.STOPPED;

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

    // Array of paged text
    this.lines = [];

    // Index of current page
    this.currentLine = 0;

    // Instance of a canvas element. Used for text width calculation.
    this.widthTestCanvas = document.createElement("canvas");

    // Callback invoked on events
    // @param {Object} Event object metadata {state: TW_STATE}
    this.eventCallback = eventCallback;

    // Method bindings
    this.calculateTextSize = this.calculateTextSize.bind(this);
    this.start = this.start.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.clear = this.clear.bind(this);
    this.update = this.update.bind(this);
    this.reset = this.reset.bind(this);
    this.stop = this.stop.bind(this);
    this.finish = this.finish.bind(this);
    this.notifyEventCallback = this.notifyEventCallback.bind(this);
    this.isOnFirstPage = this.isOnFirstPage.bind(this);
    this.isOnLastPage = this.isOnLastPage.bind(this);
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
   * @param text {String|Array of strings} The text to show. Pass in array to page out text.
   * @param startAtLastLine {Boolean} Start text at the last line
   **/
  start(text, startAtLastLine) {
    text = text || "";

    if (Array.isArray(text)) {
      this.lines = text;
      //text = startAtLastLine ? text[text.length - 1] : text[0];
      if (startAtLastLine) {
        this.currentLine = text.length - 1;
        text = text[this.currentLine];
      } else {
        text = text[0];
      }
    }
    
    this.currentCharIndex = 0;
    this.lineOffset = 0;
    this.originalText = text;
    this.fullText = text;
    this.text = "";

    clearInterval(this.interval);
    this.interval = setInterval(this.update, TW_CHAR_DELAY);
    this.state = TW_STATE.TYPING;
    this.notifyEventCallback();
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
   * Starts previous page
   **/
   prevPage() {
    if (this.state === TW_STATE.STOPPED) {
      if (this.currentLine > 0) {
        if (this.currentLine === this.lines.length) { // On last page now
          this.currentLine -= 1;
          this.finish();
        } else {
          this.currentLine -= 1;
          this.start(this.lines[this.currentLine]);
        }
      } else {
        this.reset();
      }
    }
  }

  /**
   * Starts next page if there are additional lines.
   **/
  nextPage() {
    if (this.state === TW_STATE.STOPPED) {
      if (this.currentLine < this.lines.length - 1) {
        this.currentLine += 1;
        this.start(this.lines[this.currentLine]);
      } else {
        this.finish();
      }
    }
  }

  /**
   * Removes any text from the container immediately.
   **/
  clear() {
    this.container.innerHTML = "";
    this.lines = [];
    clearInterval(this.interval);
  }

  /**
   * Restarts typing.
   **/
  reset() {
    clearInterval(this.interval);
    this.currentCharIndex = 0;
    this.lineOffset = 0;

    if (this.lines.length > 0) {
      this.currentLine = 0;
      this.start(this.lines);
    } else {
      this.start(this.originalText);
    }
  }

  /**
   * Stops typing.
   **/
  stop() {
    clearInterval(this.interval);
    this.state = TW_STATE.STOPPED;
    this.notifyEventCallback();
  }

  /**
   * All lines have been displayed.
   */
  finish() {
    this.currentLine = 0;
    this.lines = [];
    this.state = TW_STATE.FINISHED;
    this.notifyEventCallback();
  }

  /**
   * Invokes the event callback if it is set. 
   **/
  notifyEventCallback() {
    if (this.eventCallback) {
      this.eventCallback({
        state: this.state, 
        lastPage: this.isOnLastPage()
      });
    }
  }

  isOnFirstPage() {
    return (this.lines.length === 0 || this.currentLine === 0);
  }

  isOnLastPage() {
    return (this.lines.length === 0 || this.currentLine === this.lines.length - 1);
  }
}