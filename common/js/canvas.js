/******************************
 * Date: Dec 14, 2015
 * Canvas Controller
 * author: Pham Quan
 ******************************/

'use-strict';

window.requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

let Mouse = { x: 0, y: 0, dx: 0, dy: 0, isDown: false }

/*
 * Background class
 */
function Background(src, x, y, w, h) {
    this.src = src || '';
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 800;
    this.h = h || 600;
}

Background.prototype = {
    _draw: function(context) {
        let image = new Image();
        image.src = this.src;
        context.drawImage(image, this.x, this.y, this.w, this.h);
    }
}

/*
 * Item class
 */
function Item(src, x, y, w, h) {
    this.src = src || '';
    this.x = x;
    this.y = y;
    this.w = w || 80;
    this.h = h || 80;
    this.naturalW = w || 80;
    this.naturalH = h || 80;
}

Item.prototype = {
    drag: false,
    ratio: 100,
    flip: false,
    isResize: false,

    _setSize: function() {
        this.w = this.naturalW * (this.ratio/100);
        this.h = this.naturalH * (this.ratio/100);
    },

    _draw: function(context) {
        let image = new Image();
        image.src = this.src;

        if(this.flip) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(image, -(this.x + this.w), this.y, this.w, this.h);
            context.restore();
        } else {
            context.save();
            context.scale(1, 1);
            context.drawImage(image, this.x, this.y, this.w, this.h);
            context.restore();
        }
    }
}

/*
 * Text class
 */
function Text(value, x, y, w, s, f, c) {
    this.value = value || '';
    this.x = x;
    this.y = y;
    this.w = w;
    this.fontSize = s || 30;
    this.fontFamily = f || 'Arial';
    this.color = c || '#000000';
    this.lineHeight = this.fontSize * 1.2;
    this.h = this.fontSize;
}

Text.prototype = {
    drag: false,
    isTouching: false,

    _setInfo: function(x, y, w) {
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.w = parseInt(w);
    },

    _setFont: function(s, f, w, c) {
        this.fontSize = s;
        this.fontFamily = f;
        this.w = w;
        this.h = this.fontSize;
        this.color = c;
        this.lineHeight = this.fontSize * 1.2;
    },

    wrapText: function(context, x, y, text, maxWidth, lineHeight) {
        let words = text.split(' ');
        let line = '';
        for(let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
                this.h = (y - this.y) + this.fontSize;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    },

    _draw: function(canvas, context) {
        context.fillStyle = this.color;
        context.font = `${this.fontSize}px ${this.fontFamily}`;
        context.textBaseline = 'hanging';
        this.wrapText(context, this.x, this.y, this.value, this.w, this.lineHeight);

        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.w, this.y);
        context.lineTo(this.x + this.w, this.y + this.h);
        context.lineTo(this.x, this.y + this.h);
        context.lineTo(this.x, this.y);
        context.strokeStyle = 'black';
        context.stroke();
    }
}

/*
 * Card class
 */
function Card() {
    this.background = new Background();
    this.title = new Text();
    this.wish = new Text();
    this.items = [];
}

Card.prototype = {
    _setBackground: function(src, x, y, w, h) {
        this.background = new Background(src, x, y, w, h);
    },

    _getBackground: function() {
        return this.background;
    },

    _setItems: function(src, x, y, w, h) {
        this.items.push(new Item(src, x, y, w, h));
    },

    _getItems: function() {
        return this.items;
    },

    _setTitle: function(value, x, y, w, f, c) {
        this.title = new Text(value, x, y, w, f, c);
    },

    _getTitle: function() {
        return this.title;
    },

    _setWish: function(value, x, y, w, f, c) {
        this.wish = new Text(value, x, y, w, f, c);
    },

    _getWish: function() {
        return this.wish;
    },

    _draw: function(canvas, context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        this.background._draw(context);
        for(let i = 0; i < this.items.length; i++) {
            this.items[i]._draw(context);
        }
        this.title._draw(canvas, context);
        this.wish._draw(canvas, context);

        let logo = new Image();
        logo.src = 'common/img/canvas_logo.png';
        context.drawImage(logo, 0, 0, 238, 87);
    }
}


;(function() {

    // Configs
    let canvasWidth = 800, canvasHeight = 600;

    // Vars
    let canvas, context,
        backgroundEle, itemEle, titleEle, wishEle,
        downloadBtn, textWidth, fontSize, fontFamily, reSize, color,
        titleX = messageX = 100, titleY = 100, messageY = 400, titleWidth = messageWidth = 500,
        card, lastItemTouched, lastTextTouched,
        items = [];

    backgroundEle = document.querySelectorAll('#background-part li');
    itemEle = document.querySelectorAll('#object-part li');
    titleEle = document.getElementById('card-title');
    wishEle = document.getElementById('card-content');
    downloadBtn = document.getElementById('download');
    reSize = document.getElementById('object-range');
    fontSize = document.getElementById('font-size');
    fontFamily = document.getElementById('font-family');
    textWidth = document.getElementById('text-width');
    color = document.getElementById('text-color');

    canvas = document.getElementById('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');

    // Create Card object
    card = new Card();

    // Prevent event flooding
    function _debounce(fnc, wait, immediate) {
        let timeout;
        return function() {
            let context = this,
                args = arguments,
                callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if(!immediate) {
                    fnc.apply(context, args);
                }
            }, wait)
            if(callNow) {
                fnc.apply(context, args)
            }
        }
    }

    function selectBackground() {
        let src = this.children[0].src;
        card._setBackground(src, 0, 0, canvas.width, canvas.height);

        // Get info for Title + Wish
        titleX = this.children[0].dataset.titleX;
        titleY = this.children[0].dataset.titleY;
        titleWidth = this.children[0].dataset.titleWidth;
        messageX = this.children[0].dataset.messageX;
        messageY = this.children[0].dataset.messageY;
        messageWidth = this.children[0].dataset.messageWidth;

        card.title._setInfo(titleX, titleY, titleWidth);
        card.wish._setInfo(messageX, messageY, messageWidth);

        // Modify every infos after changing background
        if(lastTextTouched == 0) {
            textWidth.value = card._getTitle().w;
            fontSize.value = card._getTitle().fontSize;
            fontFamily.value = card._getTitle().fontFamily;
            color.value = card._getTitle().color;
        } else {
            textWidth.value = card._getWish().w;
            fontSize.value = card._getWish().fontSize;
            fontFamily.value = card._getWish().fontFamily;
            color.value = card._getWish().color;
        }
    }

    function selectItem() {
        let src = this.children[0].src,
            w = this.children[0].naturalWidth,
            h = this.children[0].naturalHeight,
            max = 500,
            min = 100,
            x = Math.floor((Math.random() * (max - min +1)) + min),
            y = Math.floor((Math.random() * (max - min +1)) + min);

        card._setItems(src, x, y, w, h);
        reSize.value = 100;
        lastItemTouched = card._getItems().length - 1;
    }

    function inputTitle() {
        let value = this.value ? this.value : '',
            o = card._getTitle(),
            x = o.x || titleX,
            y = o.y || titleY,
            w = o.w || titleWidth,
            s = o.fontSize || parseInt(fontSize.value),
            c = o.color || color.value,
            f = o.fontFamily || fontFamily.value;

        card._setTitle(value, x, y, w, s, f, c);
        lastTextTouched = 0;
        textWidth.value = o.w;
        fontSize.value = o.fontSize;
        fontFamily.value = o.fontFamily;
        color.value = o.color;
    }

    function inputWish() {
        let value = this.value ? this.value : '',
            o = card._getWish(),
            x = o.x || messageX,
            y = o.y || messageY,
            w = o.w || messageWidth,
            s = o.fontSize || parseInt(fontSize.value),
            c = o.color || color.value,
            f = o.fontFamily || fontFamily.value;

        card._setWish(value, x, y, w, s, f, c);
        lastTextTouched = 1;
        textWidth.value = o.w;
        fontSize.value = o.fontSize;
        fontFamily.value = o.fontFamily;
        color.value = o.color;
    }

    function changeItemSize() {
        let items = card._getItems();
        if(lastItemTouched != null) {
            items[lastItemTouched].ratio = parseInt(reSize.value);
            items[lastItemTouched]._setSize();
        }
    }

    function changeText() {
        let title = card._getTitle(),
            wish = card._getWish(),
            texts = [];

        texts.push(title, wish);
        if(lastTextTouched != null) {
            let s = parseInt(fontSize.value),
                w = parseInt(textWidth.value),
                f = fontFamily.value.toString(),
                c = color.value;

            // Set: Font-size / Font-family / Width / Height / Line-height
            texts[lastTextTouched]._setFont(s, f, w, c);
        }
    }

    const mouseMove = (e) => {
        let canvasView = canvas.getBoundingClientRect();
        Mouse.x = e.clientX - canvasView.left;
        Mouse.y = e.clientY - canvasView.top;
        let items = card._getItems(),
            title = card._getTitle(),
            wish = card._getWish();
        let array = items.concat(title, wish);

        // Set cursor when mouse is over something
        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i],
                isMouseOver = Mouse.x > item.x && Mouse.x < item.x + item.w && Mouse.y > item.y && Mouse.y < item.y + item.h;

            if(isMouseOver) {
                canvas.style.cursor = 'move';
                break;
            } else {
                canvas.style.cursor = 'default';
            }
        }

        // if object is draggable
        // Moving object along with Mouse
        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i];
            if(item.drag) {
                item.x = Mouse.x - Mouse.dx;
                item.y = Mouse.y - Mouse.dy;
            }
        }
    }

    const mouseDown = () => {
        Mouse.isDown = true;

        let items = card._getItems(),
            title = card._getTitle(),
            wish = card._getWish(),
            texts = [];

        let array = items.concat(title, wish);
        texts.push(title, wish);

        // Items
        // Input range control - item tab
        for(let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            if(
                Mouse.x > item.x &&
                Mouse.x < item.x + item.w &&
                Mouse.y > item.y &&
                Mouse.y < item.y + item.h
            ) {
                lastItemTouched = i;
                reSize.value = items[i].ratio;
                break;
            }
        }

        // Title + Wish
        // Input range control - text tab
        for(let i = texts.length - 1; i >= 0; i--) {
            let text = texts[i];
            if(
                Mouse.x > text.x &&
                Mouse.x < text.x + text.w &&
                Mouse.y > text.y &&
                Mouse.y < text.y + text.h
            ) {
                lastTextTouched = i;
                textWidth.value = texts[i].w;
                fontSize.value = texts[i].fontSize;
                fontFamily.value = texts[i].fontFamily;
                color.value = texts[i].color;
                break;
            }
        }

        // Items + Title + Wish
        // Drag/drop control
        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i];
            if(
                Mouse.x > item.x &&
                Mouse.x < item.x + item.w &&
                Mouse.y > item.y &&
                Mouse.y < item.y + item.h
            ) {
                item.drag = true;
                Mouse.dx = Mouse.x - item.x;
                Mouse.dy = Mouse.y - item.y;
                return;
            }
        }
    }

    const mouseUp = () => {
        Mouse.isDown = false;

        let items = card._getItems(),
            title = card._getTitle(),
            wish = card._getWish(),
            texts = [];

        let array = items.concat(title, wish);
        texts.push(title, wish);

        // Items
        for(let i = items.length - 1; i >= 0; i--) {
            items[i].isResize = (i == lastItemTouched) ? true : false;
        }

        // Title + Wish
        for(let i = texts.length - 1; i >= 0; i--) {
            texts[i].isTouching = (i == lastTextTouched) ? true : false;
        }

        // Items + Title + Wish
        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i];
            item.drag = false;
        }
    }

    const doubleClick = (e) => {
        let array = card._getItems();
        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i];
            if(
                Mouse.x > item.x &&
                Mouse.x < item.x + item.w &&
                Mouse.y > item.y &&
                Mouse.y < item.y + item.h
            ) {
                array.splice(i ,1);
                return;
            }
        }
    }

    const contextmenu = (e) => {
        e.preventDefault();
        let array = card._getItems();
        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i];
            if(
                Mouse.x > item.x &&
                Mouse.x < item.x + item.w &&
                Mouse.y > item.y &&
                Mouse.y < item.y + item.h
            ) {
                item.flip = !item.flip;
                return;
            }
        }
        return false;
    }

    /* --------------------------
     * Event listeners
     * -------------------------- */

    backgroundEle.forEach((element, index) => {
        backgroundEle[index].addEventListener('click', selectBackground, false);
    });
    itemEle.forEach((element, index) => {
        itemEle[index].addEventListener('click', selectItem, false);
    });
    titleEle.addEventListener('keyup', _debounce(inputTitle, 50, false), false);
    wishEle.addEventListener('keyup', _debounce(inputWish, 50, false), false);

    // all Actions on canvas
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('dblclick', doubleClick, false);
    canvas.addEventListener('contextmenu', contextmenu, false);

    // Events that Interact with inputs
    reSize.addEventListener('change', changeItemSize, false);
    reSize.addEventListener('mousemove', changeItemSize, false);
    fontSize.addEventListener('change', changeText, false);
    fontSize.addEventListener('mousemove', changeText, false);
    textWidth.addEventListener('change', changeText, false);
    textWidth.addEventListener('mousemove', changeText, false);
    color.addEventListener('change', changeText, false);
    fontFamily.addEventListener('change', changeText, false);

    // When focusing text area -> Show info of that text on input color/font-size/textbox width
    titleEle.addEventListener('focus', function() {
        let o = card._getTitle();
        lastTextTouched = 0;
        textWidth.value = o.w;
        fontSize.value = o.fontSize;
        fontFamily.value = o.fontFamily;
        color.value = o.color;
    }, false);
    wishEle.addEventListener('focus', function() {
        let o = card._getWish();
        lastTextTouched = 1;
        textWidth.value = o.w;
        fontSize.value = o.fontSize;
        fontFamily.value = o.fontFamily;
        color.value = o.color;
    }, false);

    // Download button - Save image to local computer
    downloadBtn.addEventListener('click', function() {
        canvas.toBlob(function(blob) {
            saveAs(blob, 'christmas-card.png')
        }, 'image/png');
    }, false);


    // Update loop to re-drawn
    // Guarantee 60fps
    function update() {
        card._draw(canvas, context);
        requestAnimationFrame(update);
    }
    update();
})()

