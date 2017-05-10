;(function() {
	'use strict';

	function Ball(ball) {
		this.element = ball;
		this.x = 0;
		this.y = 0;
		this.color = '#FF8A00';
		this.angle = (randomInteger(0, 360)*Math.PI)/180;	// this.angle = 45;
		this.speed = randomInteger(1, 15);	// this.speed = 10;
		this.directionX = -1;
		this.directionY = -1;
		// x-  | x+
		// y-  | y-
		// ____|____
		// x-  | x+
		// y+  | y+

		this.width = 100;
		this.height = 100;
	}
	Ball.prototype.move = function() {
		let moveX = this.x + (this.directionX * this.speed * Math.cos(this.angle)),
				moveY = this.y + (this.directionY * this.speed * Math.sin(this.angle));

		// проверка выхода за границы droppable
		if ( moveX < 0 ) {
			moveX = -moveX;
			this.directionX = -this.directionX;
			this.dublicate();
			this.explode();
		}
		if ( moveX > droppAreaWidth - this.width ) {
			moveX = droppAreaWidth - (moveX + this.width - droppAreaWidth) - this.width;
			this.directionX = -this.directionX;
			this.explode();
		}
		if ( moveY < 0 ) {
			moveY = -moveY;
			this.directionY = -this.directionY;
			this.dublicate();
			this.explode();
		}
		if ( moveY > droppAreaHeight - this.height ) {
			moveY = droppAreaHeight - (moveY +this.height - droppAreaHeight) - this.height;
			this.directionY = -this.directionY;
			this.dublicate();
			this.explode();
		}

		this.x = moveX;
		this.y = moveY;

		this.element.style.left = this.x + 'px';
		this.element.style.top = this.y + 'px';

		// console.log('move ball to', this.x, this.y)
	}
	Ball.prototype.explode = function() {
		let chance = randomInteger(1, 10);
		// ограничение кол-ва шаров
		if ( queue.length > 50 ) {
			chance = 1;
		}
		if ( chance < 2 ) {
			console.log('bang!')
			this.element.classList.add('ball__explode');
			let removed = queue.splice(queueStep, 1)
			setTimeout(()=> {
				// console.log('removed', removed)
				destroyElement(removed[0].element);
			}, 500)
		}
	}
	Ball.prototype.dublicate = function() {
		let chance = randomInteger(1, 10);
		if ( chance < 3 ) {
			console.log('dublicate')
			let clone = this.element.cloneNode(true);
			droppArea.appendChild(clone);
			let double = new Ball(clone);
			double.x = this.x;
			double.y = this.y;
			double.speed = this.speed;
			double.changeColor();

			queue.push(double);
		}
	}
	Ball.prototype.changeColor = function() {
		let color = colorCollection[randomInteger(0, colorCollection.length-1)].toUpperCase();
		if ( color == this.color ) {
			this.changeColor();
			return;
		}
		this.element.style.background = this.color = color;
	}

	// переменные
	const colorCollection = ['#FF8A00','#DB3C3C','#DE4DDC','#4ED540','#E5E74F','#B6B6B6','#76D9F5','#C6FF00','#0309FF','#FF0000'];

	const draggArea = document.getElementsByClassName('balls-area')[0],
				droppArea = document.getElementsByClassName('droppable')[0],
				droppAreaWidth = droppArea.offsetWidth,
				droppAreaHeight = droppArea.offsetHeight;

	let ballsColletion = document.getElementsByClassName('ball'),
			dragObj = {},
			balls = [],
			queue = [],
			stepTimer,
			PAUSE = false,
			PLAYING = false,
			queueStep = 0,
			storage;

	/**
	*		создаёт перетаскиваемый псевдоэлемент
	*/
	const createAvatar = ()=> {
		console.log('create avatar from', dragObj.elem)
		let avatar = dragObj.elem.cloneNode(true);
		avatar.classList.remove('draggable');
		avatar.classList.add('avatar');

		dragObj.avatar = avatar;
		document.body.appendChild(avatar);
	};

	/**
	*	
	*/
	const destroyElement = (element)=> {
		console.log('destroy');
		element.parentNode.removeChild(element);
		if ( queue.length == 0 ) {
			PLAYING = false;
		}
	};

	const onMouseDown = (e)=> {
		if ( e.which != 1 ) { return; }

		let elem = e.target.closest('.draggable');
		// console.log('down on', elem)

		if ( !elem ) { return; }
		// координаты нажатия
		dragObj.downX = e.pageX;
	  dragObj.downY = e.pageY;
	  // console.log(dragObj.downX, dragObj.downY)
	  // координаты нажатия на элементе
	  dragObj.shiftX = e.pageX - elem.getBoundingClientRect().left;
	  dragObj.shiftY = e.pageY - elem.getBoundingClientRect().top;

	  dragObj.elem = elem;
		// console.log('dragObj.elem',dragObj.elem)
		e.preventDefault();
	};

	const onMouseMove = (e)=> {
		if ( !dragObj.elem ) { return; }

		// проверка на сдвиг курсора дальше 3 пикселей
		let deltaX = e.pageX - dragObj.downX,
    		deltaY = e.pageY - dragObj.downY;
    if ( Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3 ) {
      return; // не было достаточного сдвига курсора
    }

    if ( !dragObj.avatar ) {
    	createAvatar(e);
    }
    // автар создан, приклеиваем к курсору
    dragObj.avatar.style.left = e.pageX - dragObj.shiftX + window.pageXOffset + 'px';
	  dragObj.avatar.style.top = e.pageY - dragObj.shiftY + window.pageYOffset + 'px';
	  e.preventDefault();
	};

	const onMouseUp = (e)=> {
		if ( dragObj.avatar ) {
			dragObj.avatar.style.display = 'none';
			let dropElem = document.elementFromPoint(e.clientX, e.clientY);
			dragObj.avatar.style.display = 'block';
			if ( dropElem != null ) {
				dropElem = dropElem.closest('.droppable');
				if ( dropElem != null ) {
					// определить координаты, где отпутсили и выставить на тоже место
					droppArea.appendChild(dragObj.elem)

					dragObj.elem.classList.remove('draggable');
					dragObj.elem.classList.add('ball__flying');

					let left = dragObj.avatar.style.left.split('px')[0] - droppArea.offsetLeft,
							top = dragObj.avatar.style.top.split('px')[0] - droppArea.offsetTop;

					dragObj.elem.style.left = left + 'px';
					dragObj.elem.style.top = top + 'px';

					let element = new Ball(dragObj.elem);
					element.x = left;
					element.y = top;
					console.log('set ball coor:', dragObj.elem.x, dragObj.elem.y)

					queue.push(element);
					console.log('queue', queue)

					if ( !PLAYING ) {
						PLAYING = !PLAYING;
						renderer();
					}
				}
				// console.log('dropElem2', dropElem)
			}
			destroyElement(dragObj.avatar);
		}
		dragObj.elem = null;
		dragObj.avatar = null;
		// save data
		let draggItems = [],
				tmparr = draggArea.getElementsByClassName('ball')
		for (let i = 0; i < tmparr.length; i++) {
			draggItems.push(tmparr[i].outerHTML;
		}
		storage.draggArea = draggItems;
		window.localStorage.setItem('doubleBalls', JSON.stringify(storage));
	};

	/**
	*		Запускает анимацию елементов
	*/
	const renderer = ()=> {
		if ( !PAUSE && queue.length > 0) {
			// console.log('iterate')
			let obj = {},
					tmparr = [];
			for (let i = 0; i < queue.length; i++) {
				obj = {
					angle: queue[i].angle,
					color: queue[i].color,
					directionX: queue[i].directionX,
					directionY: queue[i].directionY,
					element: queue[i].element.outerHTML,
					speed: queue[i].speed,
					x: queue[i].x,
					y: queue[i].y
				}
				tmparr.push(obj);
			}
			// save data
			storage.droppArea = tmparr;
			// console.log('try to save:',JSON.stringify(storage))
			window.localStorage.setItem('doubleBalls', JSON.stringify(storage))

			stepTimer = setTimeout(()=> {
				for (queueStep = 0; queueStep < queue.length; queueStep++) {
					// play element
					queue[queueStep].move();
				}
				renderer();
			}, 30);
		}	
	};

	/**
	*		возвращает случайное число от min до max+1
	*/
	const randomInteger = (min, max)=> {
    let rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
  }

	/**/
	const init = ()=> {
		storage = window.localStorage.getItem('doubleBalls');
		if ( storage != null ) {
			console.log('load from localStorage');
			storage = JSON.parse(storage);
			
			console.info('storage',storage);

			let tmpstr = "";
			for (let i = 0; i < storage.draggArea.length; i++) {
				tmpstr += storage.draggArea[i];
			}
			draggArea.innerHTML = tmpstr;

			tmpstr = "";
			for (let i = 0; i < storage.droppArea.length; i++) {
				tmpstr += storage.droppArea[i].element;
			}
			droppArea.innerHTML = tmpstr;

			let dropped = droppArea.getElementsByClassName('ball__flying');
			for (let i = 0; i < dropped.length; i++) {
				let element = new Ball(dropped[i]);

				element.angle = storage.droppArea[i].angle;
				element.color = storage.droppArea[i].color;
				element.directionX = storage.droppArea[i].directionX;
				element.directionY = storage.droppArea[i].directionY;
				element.speed = storage.droppArea[i].speed;
				element.x = storage.droppArea[i].x;
				element.y = storage.droppArea[i].y;

				queue.push(element);
			}
			console.log('restorded queue', queue)

			renderer();

		} else {
			console.log('no save in localStorage');
			let tmpstr ='';
			for (let i = 0; i < 3; i++) {
				tmpstr += '<div class="ball draggable"></div>';
			}
			draggArea.innerHTML = tmpstr;

			storage = {};
			let draggItems = draggArea.getElementsByClassName('ball');
			storage.draggArea = [];
			for (let i = 0; i < draggItems.length; i++) {
				storage.draggArea.push(draggItems[i].outerHTML;
			}
			console.log(storage.draggArea)

			storage.droppArea = [];
		}
	};

	document.addEventListener('mousedown', (e)=> {
		onMouseDown(e)
	});

	document.addEventListener('mousemove', (e)=> {
		onMouseMove(e)
	});

	document.addEventListener('mouseup', (e)=> {
		onMouseUp(e)
	});

	// кнопка паузы добавлена для удобства :)
	document.getElementById('pause-btn').addEventListener('click', ()=> {
		console.warn('toggle PAUSE')
		PAUSE = !PAUSE;
		if( !PAUSE ) {
			renderer();
		}
	})

	init();

})();
/**
*		полифил для closest()
*/
(function(ELEMENT) {
    ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
    ELEMENT.closest = ELEMENT.closest || function closest(selector) {
        if (!this) return null;
        if (this.matches(selector)) return this;
        if (!this.parentElement) {return null}
        else return this.parentElement.closest(selector)
      };
}(Element.prototype));