SF.pl.snowstorm = (function (window, document, $) {
	if (! SF.fn.isChristmasDay())
		return new SF.plugin;

	var s = this,
		storm = this,
		area = null,
		factor = null,
		screenX = null,
		screenX2 = null,
		screenY = null,
		scrollY = null,
		vRndX = null,
		vRndY = null,
		windOffset = 1,
		windMultiplier = 2,
		flakeTypes = 8,
		fixedForEverything = false,
		didInit = false,
		docFrag = document.createDocumentFragment();

	storm.animationInterval = 42;
	storm.flakeBottom = null;
	storm.followMouse = true;
	storm.snowCharacter = 'C';
	storm.snowColor = '#fff';
	storm.snowCharacterColor = storm.snowCharacterColor || storm.snowColor;
	storm.snowStick = true;
	storm.targetElement = null;
	storm.useMeltEffect = true;
	storm.useTwinkleEffect = false;
	storm.usePositionFixed = true;
	storm.freezeOnBlur = true;
	storm.flakeLeftOffset = 0;
	storm.flakeRightOffset = 0;
	storm.vMaxX = 2.5;
	storm.vMaxY = 2.5;
	storm.zIndex = 100000;
	storm.timers = [];
	storm.flakes = [];
	storm.disabled = false;
	storm.active = false;
	storm.meltFrameCount = 20;
	storm.meltFrames = [];

	storm.events = (function () {
		var slice = Array.prototype.slice,
			evt = {
				add: 'addEventListener',
				remove: 'removeEventListener'
			};

		function getArgs(oArgs) {
			var args = slice.call(oArgs),
				len = args.length;
			if (len === 3)
				args.push(false);
			return args;
		}

		function apply(args, sType) {
			var element = args.shift(),
				method = [evt[sType]];
			element[method].apply(element, args);
		}

		function addEvent() {
			apply(getArgs(arguments), 'add');
		}

		function removeEvent() {
			apply(getArgs(arguments), 'remove');
		}
		return {
			add: addEvent,
			remove: removeEvent
		};
	}());

	function rnd(n, min) {
		if (isNaN(min))
			min = 0;
		return (Math.random() * n) + min;
	}

	function plusMinus(n) {
		return (parseInt(rnd(2), 10) === 1 ? -n : n);
	}

	storm.randomizeWind = function () {
		vRndX = plusMinus(rnd(s.vMaxX, 0.2));
		vRndY = rnd(s.vMaxY, 0.2);
		if (this.flakes)
			for (var i = 0; i < this.flakes.length; i++)
				if (this.flakes[i].active)
					this.flakes[i].setVelocities();
	};

	storm.randomizeFlakesMax = function () {
		area = innerHeight * innerWidth;
		while (factor === null || factor < 0.75 || factor > 1) {
			factor = Math.random();
		}
		factor = factor * 15000;

		storm.flakesMax = area / factor;
		storm.flakesMaxActive = area / factor;
	};

	storm.scrollHandler = function () {
		scrollY = (s.flakeBottom ? 0 : parseInt(window.scrollY, 10));
		if (isNaN(scrollY))
			scrollY = 0;
		if (!fixedForEverything && !s.flakeBottom && s.flakes)
			for (var i = s.flakes.length; i--;)
				if (s.flakes[i].active === 0)
					s.flakes[i].stick();
	};

	storm.resizeHandler = function () {
		if (window.innerWidth || window.innerHeight) {
			screenX = window.innerWidth - 16 - s.flakeRightOffset;
			screenY = (s.flakeBottom ? s.flakeBottom : window.innerHeight);
		} else {
			screenX = document.documentElement.clientWidth - 8 - s.flakeRightOffset;
			screenY = s.flakeBottom ? s.flakeBottom : document.documentElement.clientHeight;
		}
		screenX2 = parseInt(screenX / 2, 10);
		s.randomizeFlakesMax();
	};

	storm.resizeHandlerAlt = function () {
		screenX = s.targetElement.offsetLeft + s.targetElement.offsetWidth - s.flakeRightOffset;
		screenY = s.flakeBottom ? s.flakeBottom : s.targetElement.offsetTop + s.targetElement.offsetHeight;
		screenX2 = parseInt(screenX / 2, 10);
		s.randomizeFlakesMax();
   };

	storm.freeze = function () {
		if (!s.disabled)
			s.disabled = 1;
		else
			return false;
		for (var i = s.timers.length; i--;)
			clearInterval(s.timers[i]);
	};

	storm.resume = function () {
		if (s.disabled)
			s.disabled = 0;
		else
			return false;
		s.timerInit();
	};

	storm.toggleSnow = function () {
		if (!s.flakes.length) {
			s.start();
		} else {
			s.active = !s.active;
			if (s.active) {
				s.show();
				s.resume();
			} else {
				s.stop();
				s.freeze();
			}
		}
	};

	storm.stop = function () {
		this.freeze();
		for (var i = this.flakes.length; i--;)
			this.flakes[i].o.style.display = 'none';
		s.events.remove(window, 'scroll', s.scrollHandler);
		s.events.remove(window, 'resize', s.resizeHandler);
		if (s.freezeOnBlur) {
			s.events.remove(window, 'blur', s.freeze);
			s.events.remove(window, 'focus', s.resume);
		}
	};

	storm.show = function () {
		for (var i = this.flakes.length; i--;)
			this.flakes[i].o.style.display = 'block';
	};

	storm.SnowFlake = function (parent, type, x, y) {
		var s = this,
			storm = parent;
		s.type = type;
		s.x = x || parseInt(rnd(screenX - 20), 10);
		s.y = (!isNaN(y) ? y : -rnd(screenY) - 12);
		s.vX = null;
		s.vY = null;
		s.vAmpTypes = [1, 1.2, 1.4, 1.6, 1.8, 3, 2, 1];
		s.vAmp = s.vAmpTypes[s.type];
		s.melting = false;
		s.meltFrameCount = storm.meltFrameCount;
		s.meltFrames = storm.meltFrames;
		s.meltFrame = 0;
		s.twinkleFrame = 0;
		s.active = 1;
		s.o = document.createElement('div');
		s.o.style.position = (fixedForEverything ? 'fixed' : 'absolute');
		if (type >= 6) {
			s.isSnowCharacter = true;
			s.flakeWidth = s.flakeHeight = 32;
			s.o.innerHTML = storm.snowCharacter;
			s.o.style.color = storm.snowCharacterColor;
			var size = 32;
			this.o.className = 'storm-snow-character';
			this.o.classList.add(parseInt(rnd(2), 10) ? 'storm-snowflake-cw' : 'storm-snowflake-ccw');
			this.o.style.webkitAnimationDuration = parseInt(rnd(2, 15 - (s.vAmp * 3)), 10) + 's';
		} else {
			s.flakeWidth = s.flakeHeight = 3;
			s.o.style.backgroundColor = storm.snowColor;
			s.o.style.boxShadow = '0 2px 2px rgba(0, 0, 0, .1)';
			var size = 3 + s.type;
			s.o.style.width = s.o.style.height = size + 'px';
			s.o.style.borderRadius = (size / 2) + 'px';
		}
		s.o.style.zIndex = storm.zIndex;
		docFrag.appendChild(s.o);

		s.refresh = function () {
			if (isNaN(s.x) || isNaN(s.y))
				return false;
			s.o.style.left = s.x + 'px';
			s.o.style.top = s.y + 'px';
		};

		s.stick = function () {
			if ((storm.targetElement !== document.documentElement && storm.targetElement !== document.body)) {
				s.o.style.top = (screenY + scrollY - s.flakeHeight) + 'px';
			} else if (storm.flakeBottom) {
				s.o.style.top = storm.flakeBottom + 'px';
			} else {
				s.o.style.display = 'none';
				s.o.style.top = 'auto';
				s.o.style.bottom = '0px';
				s.o.style.position = 'fixed';
				s.o.style.display = 'block';
			}
		};

		s.vCheck = function () {
			if (s.vX >= 0 && s.vX < 0.2)
				s.vX = 0.2;
			else if (s.vX < 0 && s.vX > -0.2)
				s.vX = -0.2;
			if (s.vY >= 0 && s.vY < 0.2)
				s.vY = 0.2;
		};

		s.move = function () {
			var vX = s.vX * windOffset,
				yDiff;
			s.x += vX;
			s.y += s.vY * s.vAmp;
			if (s.x >= screenX || screenX - s.x < s.flakeWidth)
				s.x = 0;
			else if (vX < 0 && s.x - storm.flakeLeftOffset < -s.flakeWidth)
				s.x = screenX - s.flakeWidth - 1;
			s.refresh();
			yDiff = screenY + scrollY - s.y;
			if (yDiff < s.flakeHeight) {
				s.active = 0;
				if (storm.snowStick)
					s.stick();
				else
					s.recycle();
			} else {
				if (storm.useMeltEffect && s.active && s.type < 3 && !s.melting && Math.random() > 0.998) {
					s.melting = true;
					s.melt();
				}
				if (storm.useTwinkleEffect) {
					if (!s.twinkleFrame) {
						if (Math.random() > 0.9)
							s.twinkleFrame = parseInt(Math.random() * 20, 10);
					} else {
						s.twinkleFrame--;
						s.o.style.visibility = (s.twinkleFrame && s.twinkleFrame % 2 === 0 ? 'hidden' : 'visible');
					}
				}
			}
		};

		s.setVelocities = function () {
			s.vX = vRndX + rnd(storm.vMaxX * 0.12, 0.1);
			s.vY = vRndY + rnd(storm.vMaxY * 0.12, 0.1);
		};

		s.melt = function () {
			if (!storm.useMeltEffect || !s.melting) {
				s.recycle();
			} else {
				if (s.meltFrame < s.meltFrameCount) {
					s.meltFrame++;
					s.setOpacity(s.meltFrames[s.meltFrame]);
					if (! s.isSnowCharacter) {
						s.o.style.fontSize = s.fontSize - (s.fontSize * (s.meltFrame / s.meltFrameCount)) + 'px';
						s.o.style.lineHeight = s.flakeHeight + 2 + (s.flakeHeight * 0.75 * (s.meltFrame / s.meltFrameCount)) + 'px';
					}
				} else {
					s.recycle();
				}
			}
		};

		s.recycle = function () {
			s.o.style.display = 'none';
			s.o.style.position = (fixedForEverything ? 'fixed' : 'absolute');
			s.o.style.bottom = 'auto';
			s.setVelocities();
			s.vCheck();
			s.meltFrame = 0;
			s.melting = false;
			s.setOpacity(1);
			s.o.style.padding = '0px';
			s.o.style.margin = '0px';
			if (! s.isSnowCharacter) {
				s.o.style.fontSize = s.fontSize + 'px';
				s.o.style.lineHeight = (s.flakeHeight + 2) + 'px';
			}
			s.o.style.textAlign = 'center';
			s.o.style.verticalAlign = 'baseline';
			s.x = parseInt(rnd(screenX - s.flakeWidth - 20), 10);
			s.y = parseInt(rnd(screenY) * -1, 10) - s.flakeHeight;
			s.refresh();
			s.o.style.display = 'block';
			s.o.style.webkitAnimationName = '';
			s.active = 1;
		};
		s.recycle();
		s.refresh();
	};

	storm.SnowFlake.prototype.setOpacity = function (opacity) {
		this.o.style.opacity = opacity;
	};

	storm.SnowFlake.prototype.animate = function () {
		this.move();
	};

	storm.snow = function () {
		var active = 0,
			used = 0,
			waiting = 0,
			flake = null;
		for (var i = s.flakes.length; i--;) {
			if (s.flakes[i].active === 1) {
				s.flakes[i].move();
				active++;
			} else if (s.flakes[i].active === 0) {
				used++;
			} else {
				waiting++;
			}
			if (s.flakes[i].melting)
				s.flakes[i].melt();
		}
		flakes.forEach(function(flake) {
			if (flake.isSnowCharacter && flake.active === 0) {
				flake.o.style.webkitAnimationName = 'none';
			}
		});
		if (active < s.flakesMaxActive) {
			flake = s.flakes[parseInt(rnd(s.flakes.length), 10)];
			if (flake.active === 0)
				flake.melting = true;
		}
	};

	storm.mouseMove = function (e) {
		if (!s.followMouse)
			return true;
		var x = parseInt(e.clientX, 10);
		if (x < screenX2) {
			windOffset = -windMultiplier + (x / screenX2 * windMultiplier);
		} else {
			x -= screenX2;
			windOffset = (x / screenX2) * windMultiplier;
		}
	};

	storm.createSnow = function (limit, allowInactive) {
		for (var i = 0; i < limit; i++) {
			s.flakes[s.flakes.length] = new s.SnowFlake(s, parseInt(rnd(flakeTypes), 10));
			if (allowInactive || i > s.flakesMaxActive)
				s.flakes[s.flakes.length - 1].active = -1;
		}
		storm.targetElement.appendChild(docFrag);
	};

	storm.timerInit = function () {
		s.timers = [setInterval(s.snow, s.animationInterval)];
	};

	storm.init = function () {
		for (var i = 0; i < s.meltFrameCount; i++)
			s.meltFrames.push(1 - (i / s.meltFrameCount));
		s.randomizeWind();
		s.createSnow(s.flakesMax);
		s.events.add(window, 'resize', s.resizeHandler);
		s.events.add(window, 'scroll', s.scrollHandler);
		if (s.freezeOnBlur) {
			s.events.add(window, 'blur', s.freeze);
			s.events.add(window, 'focus', s.resume);
		}
		s.resizeHandler();
		s.scrollHandler();
		if (s.followMouse)
			s.events.add(window, 'mousemove', s.mouseMove);
		s.animationInterval = Math.max(20, s.animationInterval);
		s.timerInit();
	};

	storm.start = function (bFromOnLoad) {
		if (!didInit)
			didInit = true;
		else if (bFromOnLoad)
			return true;
		if (typeof s.targetElement === 'string') {
			var targetID = s.targetElement;
			s.targetElement = document.getElementById(targetID);
			if (!s.targetElement)
				throw new Error('Snowstorm: Unable to get targetElement "' + targetID + '"');
		}
		s.targetElement = s.targetElement || document.documentElement;
		if (s.targetElement !== document.documentElement && s.targetElement !== document.body)
			s.resizeHandler = s.resizeHandlerAlt;
		s.resizeHandler();
		fixedForEverything = s.usePositionFixed;
		if (screenX && screenY && !s.disabled) {
			s.init();
			s.active = true;
		}
	};

	function listener() {
		if ($('#sf_stop_snow').length)
			return;

		toggleSnow();

        var $stop_snow = $('<a />');
        $stop_snow.attr('title', '停止下雪效果');
        $stop_snow.attr('innerHTML', '停止！');
        $stop_snow.attr('id', 'sf_stop_snow');

        $stop_snow.click(function(e) {
            e.preventDefault();
			toggleSnow();
            $stop_snow.remove();
        });
        $('body').append($stop_snow);
	}

	return {
		load: function() {
			addEventListener('merry_christmas', listener, false);

			var event = document.createEvent('Event');
			event.initEvent('sf_plugin_snowstorm_loaded', false, false);
			dispatchEvent(event);
		},
		unload: function() {
			removeEventListener('merry_christmas', listener, false);
			storm.stop();
		}
	};
}(window, document, jQuery));
