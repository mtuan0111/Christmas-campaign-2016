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
function Item(src, x, y, w, h, drag) {
    this.src = src || '';
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 80;
    this.h = h || 80;
}

Item.prototype = {
    drag: false,

    _draw: function(context) {
        let image = new Image();
        image.src = this.src;
        context.drawImage(image, this.x, this.y, this.w, this.h);
    }
}

/*
 * Text class
 */
function Text(x, y, value, w) {
    this.x = x || 100;
    this.y = y || 100;
    this.value = value || '';
    this.width = w || 400;
}

Text.prototype = {
    _setInfo: function(x, y, w) {
        this.x = x;
        this.y = y;
        this.width = w;
    },

    _parseInt: function() {
        this.x = parseInt(this.x);
        this.y = parseInt(this.y);
        this.width = parseInt(this.width);
    },

    wrapText: function(context, x, y, text, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    },

    _draw: function(canvas, context) {
        context.fillStyle = '#000';
        context.textAlign = 'left';
        context.font = `24px Arial`;
        this._parseInt();
        this.wrapText(context, this.x, this.y, this.value, this.width, 30);
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

    _setTitle: function(x, y, value, w) {
        this.title = new Text(x, y, value, w);
    },

    _getTitle: function() {
        return this.title;
    },

    _setWish: function(x, y, value, w) {
        this.wish = new Text(x, y, value, w);
    },

    _getWish: function() {
        return this.wish;
    },

    _draw: function(canvas, context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.background._draw(context);
        this.title._draw(canvas, context);
        this.wish._draw(canvas, context);
        for(let i = 0; i < this.items.length; i++) {
            this.items[i]._draw(context);
        }
    }
}


;(function() {

    // Configs
    let canvasWidth = 800, canvasHeight = 600;

    // Vars
    let canvas, context,
        backgroundEle, itemEle, titleEle, wishEle,
        titleX = 100, titleY = 100, titleWidth = 500,
        messageX = 100, messageY = 400, messageWidth = 500,
        card,
        items = [];


    card = new Card();

    backgroundEle = document.querySelectorAll('#background-part li');
    itemEle = document.querySelectorAll('#object-part li');
    titleEle = document.getElementById('card-title');
    wishEle = document.getElementById('card-content');

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

        console.log(messageX);

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

        card._setItems(src, x, y, w, h);
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
            x = titleX || null,
            y = titleY || null,
            w = titleWidth || 500;
        card._setTitle(x, y, value, w);
    }

    function inputWish() {
        console.log(messageX);
        let value = this.value ? this.value : '',
            x = messageX || null,
            y = messageY || null,
            w = messageWidth || 500;
        card._setWish(x, y, value, w);
    }

    const mouseMove = (e) => {
        let canvasView = canvas.getBoundingClientRect();
        Mouse.x = e.clientX - canvasView.left;
        Mouse.y = e.clientY - canvasView.top;
        let items = card._getItems();
        for(let i = items.length - 1; i >= 0; i--) {
            let item = items[i],
                isMouseOver = Mouse.x > item.x && Mouse.x < item.x + item.w && Mouse.y > item.y && Mouse.y < item.y + item.h;

            if(isMouseOver) {
                canvas.style.cursor = 'pointer';
                break;
            } else {
                canvas.style.cursor = 'default';
            }
        }

        for(let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            if(item.drag) {
                item.x = Mouse.x - Mouse.dx;
                item.y = Mouse.y - Mouse.dy;
            }
        }
    }

    const mouseDown = () => {
        Mouse.isDown = true;
        let items = card._getItems();
        for(let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            if(
                Mouse.x > item.x &&
                Mouse.x < item.x + item.w &&
                Mouse.y > item.y &&
                Mouse.y < item.y + item.h
            ) {
                item.drag = true;
                Mouse.dx = Mouse.x - item.x;
                Mouse.dy = Mouse.y - item.y;
                // console.log(`item[${i}] is draggable.`);
                return;
            }
        }
    }

    const mouseUp = () => {
        Mouse.isDown = false;
        let items = card._getItems();
        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            item.drag = false;
        }
    }

    const doubleClick = (e) => {
        let items = card._getItems();
        for(let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            if(
                Mouse.x > item.x &&
                Mouse.x < item.x + item.w &&
                Mouse.y > item.y &&
                Mouse.y < item.y + item.h
            ) {
                // console.log(`remove item[${i}].`);
                items.splice(i ,1);
                return;
            }
        }
    }

    /*
     * Event listeners
     */

    backgroundEle.forEach(function(element, index) {
        backgroundEle[index].addEventListener('click', selectBackground, false);
    });

    itemEle.forEach(function(element, index) {
        itemEle[index].addEventListener('click', selectItem, false);
    });

    titleEle.addEventListener('keyup', _debounce(inputTitle, 50, false), false);
    wishEle.addEventListener('keyup', _debounce(inputWish, 50, false), false);

    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('dblclick', doubleClick, false);

    // Update loop
    function update() {
        card._draw(canvas, context);
        requestAnimationFrame(update);
    }
    update();
})()

