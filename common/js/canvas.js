'use-strict';

window.requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

let Mouse = {
    x: 0, y: 0, dx: 0, dy: 0, isDown: false
}

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
    this.x = x || 0;
    this.y = y || 0;
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
function Text(value, x, y, w) {
    this.value = value || '';
    this.x = x || 100;
    this.y = y || 100;
    this.w = w || 0;
}

Text.prototype = {
    drag: false,
    h: 24,
    fontSize: 30,
    lineHeight: 32,

    _setInfo: function(x, y, w) {
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.w = parseInt(w);
    },

    _setFont: function(s, l) {
        this.fontSize = parseInt(s);
        this.lineHeight = parseInt(l);
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
        context.fillStyle = '#000';
        context.font = `${this.fontSize}px Arial`;
        context.textBaseline = 'hanging';
        this.wrapText(context, this.x, this.y, this.value, this.w, this.lineHeight);
        // context.beginPath();
        // context.moveTo(this.x, this.y);
        // context.lineTo(this.x + this.w, this.y);
        // context.lineTo(this.x + this.w, this.y + this.h);
        // context.lineTo(this.x, this.y + this.h);
        // context.lineTo(this.x, this.y);
        // context.strokeStyle = 'red';
        // context.stroke();
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

    _setTitle: function(value, x, y, w) {
        this.title = new Text(value, x, y, w);
    },

    _getTitle: function() {
        return this.title;
    },

    _setWish: function(value, x, y, w) {
        this.wish = new Text(value, x, y, w);
    },

    _getWish: function() {
        return this.wish;
    },

    _draw: function(canvas, context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.background._draw(context);
        for(let i = 0; i < this.items.length; i++) {
            this.items[i]._draw(context);
        }
        this.title._draw(canvas, context);
        this.wish._draw(canvas, context);
    }
}


;(function() {

    // Configs
    let canvasWidth = 800, canvasHeight = 600;

    // Vars
    let canvas, context,
        backgroundEle, itemEle, titleEle, wishEle, downloadBtn,
        titleX = 100, titleY = 100, titleWidth = 500,
        messageX = 100, messageY = 400, messageWidth = 500,
        card, lastTouch,
        items = [];


    card = new Card();

    backgroundEle = document.querySelectorAll('#background-part li');
    itemEle = document.querySelectorAll('#object-part li');
    titleEle = document.getElementById('card-title');
    wishEle = document.getElementById('card-content');
    downloadBtn = document.getElementById('download');
    reSize = document.getElementById('object-range');

    canvas = document.getElementById('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');

    function selectBackground() {
        let src = this.children[0].src;
        card._setBackground(src, 0, 0, canvas.width, canvas.height);

        // get info for Title + Wish
        titleX = this.children[0].dataset.titleX;
        titleY = this.children[0].dataset.titleY;
        titleWidth = this.children[0].dataset.titleWidth;
        messageX = this.children[0].dataset.messageX;
        messageY = this.children[0].dataset.messageY;
        messageWidth = this.children[0].dataset.messageWidth;

        card.title._setInfo(titleX, titleY, titleWidth);
        card.wish._setInfo(messageX, messageY, messageWidth);
    }

    function selectItem() {
        let src = this.children[0].src,
            w = this.children[0].naturalWidth,
            h = this.children[0].naturalHeight,
            max = 500,
            min = 100,
            x = Math.floor((Math.random() * (max - min +1)) + min),
            y = Math.floor((Math.random() * (max - min +1)) + min);

        reSize.value = 100;
        card._setItems(src, x, y, w, h);
        lastTouch = card._getItems().length - 1;
    }

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

    function inputTitle() {
        let value = this.value ? this.value : '',
            x = card._getTitle().x || titleX,
            y = card._getTitle().y || titleY,
            w = card._getTitle().w || titleWidth;
        card._setTitle(value, x, y, w);
    }

    function inputWish() {
        // seperating title and message from the beginning
        card._getWish().y = 300;
        let value = this.value ? this.value : '',
            x = card._getWish().x || messageX,
            y = card._getWish().y || messageY,
            w = card._getWish().w || messageWidth;
        card._setWish(value, x, y, w);
    }

    function changeSize() {
        let items = card._getItems();
        items[lastTouch].ratio = parseInt(reSize.value);
        console.log(lastTouch, items[lastTouch].ratio);
        items[lastTouch]._setSize();
    }

    const mouseMove = (e) => {
        let canvasView = canvas.getBoundingClientRect();
        Mouse.x = e.clientX - canvasView.left;
        Mouse.y = e.clientY - canvasView.top;
        let items = card._getItems(),
            title = card._getTitle(),
            wish = card._getWish();
        let array = items.concat(title, wish);

        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i],
                isMouseOver = Mouse.x > item.x && Mouse.x < item.x + item.w && Mouse.y > item.y && Mouse.y < item.y + item.h;

            if(isMouseOver) {
                canvas.style.cursor = 'pointer';
                break;
            } else {
                canvas.style.cursor = 'default';
            }
        }

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
            wish = card._getWish();
        let array = items.concat(title, wish);

        for(let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            if(
                Mouse.x > item.x &&
                Mouse.x < item.x + item.w &&
                Mouse.y > item.y &&
                Mouse.y < item.y + item.h
            ) {
                lastTouch = i;
                reSize.value = items[i].ratio;
                break;
            }
        }

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
            wish = card._getWish();
        let array = items.concat(title, wish);

        for(let i = items.length - 1; i >= 0; i--) {
            items[i].isResize = (i == lastTouch) ? true : false;
        }

        for(let i = array.length - 1; i >= 0; i--) {
            let item = array[i];
            item.drag = false;
        }
    }

    const doubleClick = (e) => {
        let array = card._getItems();
        // lastTouch = null;
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

    /*
     * Event listeners
     */

    backgroundEle.forEach((element, index) => {
        backgroundEle[index].addEventListener('click', selectBackground, false);
    });
    itemEle.forEach((element, index) => {
        itemEle[index].addEventListener('click', selectItem, false);
    });
    titleEle.addEventListener('keyup', _debounce(inputTitle, 50, false), false);
    wishEle.addEventListener('keyup', _debounce(inputWish, 50, false), false);

    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('dblclick', doubleClick, false);
    canvas.addEventListener('contextmenu', contextmenu, false);
    reSize.addEventListener('change', changeSize, false);
    downloadBtn.addEventListener('click', function() {
        canvas.toBlob(function(blob) {
            saveAs(blob, 'christmas-card.png')
        }, 'image/png');
    }, false);


    // Update loop
    function update() {
        card._draw(canvas, context);
        requestAnimationFrame(update);
    }
    update();
})()

