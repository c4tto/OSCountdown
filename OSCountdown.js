var OSCountdown = (function () {
	'use strict'
	var OSCheckNum = 6781,
		OSTimerClassName = 'OSCountdown',
		lib = {
			addEventListener: function (el, ev, func) {
				if (el.addEventListener) {
					el.addEventListener(ev, func, false);
				} else {
					el.attachEvent('on' + ev, func);
				}
			},
			extend: function (obj, attrs) {
				for (var i in attrs) {
					obj[i] = attrs[i];
				}
			},
			bind: function (fn, obj) {
				return function () {
					return fn.apply(obj, arguments);
				};
			},
			domArray: function (o) {
				if (typeof o == 'string') {
					return Array.prototype.slice.call(document.querySelectorAll(o));
				} else if (typeof o == 'object') {
					if (o.toString().search(/^\[object (HTMLCollection|NodeList|Object)\]$/) >= 0) {
						return Array.prototype.slice.call(o, 0);
					} else if (o.toString().search(/^\[object HTML.+Element\]$/) >= 0) {
						return [o]
					}
				}
				return [];
			},
			parseParams: function (params) {
				var o = {};
				params.map(function (param) {
					return param.split(/=/);
				}).forEach(function (param) {
					o[param[0]] = param[1];
				});
				return o;
			},
			encodeDate: function (date) {
				var time = Math.floor(date.getTime() / 1000),
					check = '' + (time %  OSCheckNum);
				while (check.length < 4) {
					check = '0' + check;
				}
				return time + check;
			},
			decodeDate: function (timeStr) {
				if (typeof timeStr == 'string') {
					var valueStr = timeStr.substring(0, timeStr.length -4),
						checkStr = timeStr.substring(valueStr.length),
						value = parseInt(valueStr, 10),
						check = parseInt(checkStr, 10);
					if (value % OSCheckNum == check) {
						return new Date(value * 1000);
					}
				}
				return null;
			},
			addToDate: function (date, periods) {
				var p = {},
					passed = false;
				['seconds', 'minutes', 'hours', 'days', 'months'].forEach(function (periodId) {
					var value = periods[periodId];
					if (passed) {
						p[periodId] =  value || 0;
					} else if (typeof value == 'number') {
						p[periodId] = value + 1;
						passed = true;
					}
				});
				return new Date(date.getFullYear(), 
					(typeof p.months == 'number') ? date.getMonth() + p.months : 0,
					(typeof p.days == 'number') ? date.getDate() + p.days : 0,
					(typeof p.hours == 'number') ? date.getHours() + p.hours : 0,
					(typeof p.minutes == 'number') ? date.getMinutes() + p.minutes : 0,
					(typeof p.seconds == 'number') ? date.getSeconds() + p.seconds : 0);
			},
			setCookie: function (key, value, o) {
				key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
				key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
				o = o || {};
				if (value == null || value == undefined) {
					o.expires = new Date(0);
				} else {
					value = ('' + value).replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
				}
				if ((typeof o.expires == 'object') && !(o.expires instanceof Date)) {
					o.expires = lib.addToDate(new Date(), o.expires);
				}
				o.path = o.path || '/';

				var cookieString = key + '=' + value;
				cookieString += o.path ? ';path=' + o.path : '';
				cookieString += o.domain ? ';domain=' + o.domain : '';
				cookieString += o.expires ? ';expires=' + o.expires.toUTCString() : '';
				cookieString += o.secure ? ';secure' : '';

				document.cookie = cookieString;
			},
			getCookie: function (key) {
				var cookies = lib.parseParams(document.cookie.split(/; */));
				return cookies[key];
			}
		};

	var Timer = function (o) {
		lib.extend(this, o);
		this.init();
	};
	Timer.prototype = {
		init: function () {
			var date = this.getEndDate();
			if (date) {
				this.setEndDate(date);
				this.initTargets();
			}
		},
		getEndDate: function (paramName) {
			var urlParams = lib.parseParams(location.search.replace(/^\?/, '').split(/&/)),
				urlDate = lib.decodeDate(urlParams[this.paramName]),
				cookieDate = lib.decodeDate(lib.getCookie(this.paramName));

			if (urlDate && cookieDate) {
				return cookieDate.getTime() > urlDate.getTime() ? cookieDate : urlDate;
			} else {
				return urlDate || cookieDate;
			}
		},
		setEndDate: function (date) {
			this.endDate = date instanceof Date ? date : lib.addToDate(new Date(), date);
			lib.setCookie(this.paramName, lib.encodeDate(this.endDate), {
				expires: lib.addToDate(this.endDate, {
					days: 30
				})
			});
		},
		initTargets: function () {
			this.targets = lib.domArray(this.target);
			if (this.targets.length == 0)  {
				var target = document.createElement('div'),
					body = document.getElementsByTagName('body')[0];
				body.appendChild(target);
				target.className = OSTimerClassName;
				this.targets = [target];
			}
		},
		start: function () {
			if (this.endDate) {
				this.update();
				this.timer = setInterval(lib.bind(this.update, this), 1000);
			}
		},
		stop: function () {
			clearInterval(this.timer);
		},
		getContentString: function (time) {
			if (time >= 0) {
				var dateObject = {
						seconds: time % 60,
						minutes: Math.floor(time / 60) % 60,
						hours: Math.floor(time / (60 * 60)) % 24,
						days: Math.floor(time / (60 * 60 * 24)),
					},
					timeHtml = this.templateHtml;
				for (var periodId in dateObject) {
					var period = dateObject[periodId],
						periodName = this.getPeriodName(this.periodNames[periodId], period);
					timeHtml = timeHtml.replace('{' + periodId + 'Name}', periodName)
								.replace('{' + periodId + '}', dateObject[periodId]);
				}
				return timeHtml;
			} else {
				return null;
			}
		},
		update: function () {
			var date = new Date(),
				time = Math.floor((this.endDate.getTime() - date.getTime()) / 1000),
				contentStr = this.getContentString(time);
			this.targets.forEach(function (target) {
				target.innerHTML = contentStr || '';
			}, this);
			if (time >= 0) {
				if (typeof this.updateCallback == 'function') {
					this.updateCallback.call(this, time, this.endDate);
				}
			} else {
				this.stop();
				if (typeof this.expirationCallback == 'function') {
					this.expirationCallback.call(this, this.endDate);
				}
				if (this.expirationUrl) {
					location = this.expirationUrl;
				}
			}
		},
		getPeriodName: function (periodNames, value) {
			periodNames = (periodNames.constructor == Array) ? periodNames : [periodNames];
			var last = periodNames.length - 1;
			switch (value) {
			case 1:
				return periodNames[0];
			case 2: case 3: case 4:
				return periodNames[Math.min(1, last)];
			default:
				return periodNames[last];
			}
		}
	};
	var Form = function (o) {
		lib.extend(this, o);
		this.init();
	};
	Form.prototype = {
		init: function () {
			this.inputs = lib.domArray(document.getElementsByName(this.inputName));
			this.inputs.forEach(function (input) {
				lib.addEventListener(input.form, 'submit', lib.bind(function (ev) {
					var date = lib.addToDate(new Date(), this.duration);
					input.value = lib.encodeDate(date);
				}, this));
			}, this);
		}
	};
	return {
		Form: Form,
		Timer: Timer,
		lib: lib
	};
})();

