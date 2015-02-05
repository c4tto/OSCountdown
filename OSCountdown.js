var OSCountdown = (function () {
	var lib = {
		addEventListener: function (el, ev, func) {
			if (el.addEventListener) {
				el.addEventListener(ev, func, false);
			} else {
				el.attachEvent('on' + ev, func);
			}
		},
		array: function (col) {
			return Array.prototype.slice.call(col, 0);
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
	},
	checkNum = 6781;
	var Timer = function (o) {
		lib.extend(this, o);
		this.init();
	};
	Timer.prototype = {
		init: function () {
			var params = this.parseParams(location.search.replace(/^\?/, '').split(/&/)),
				timeParam = params[this.paramName],
				time = this.getTime(timeParam);
			if (time === null) {
				params = this.parseParams(document.cookie.split(/; */));
				timeParam = params[this.paramName];
				time = this.getTime(timeParam);
			}
			if (time) {
				this.endDate = new Date(time * 1000);
				this.target = this.createTarget(this.targetClass);
				var d = new Date((time + 30 * 24 * 60 * 60) * 1000);
				document.cookie = this.paramName + '=' + timeParam + '; expires=' + d.toUTCString() + '; path=/';
			}
		},
		createTarget: function (className) {
			var target = document.createElement('div'),
				body = document.getElementsByTagName('body')[0];
			target.className = className;
			body.appendChild(target);
			return target;
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
		getTime: function (timeParam) {
			if (!timeParam) {
				return null;
			}
			var timeStr = timeParam.substring(0, timeParam.length -4),
				checkStr = timeParam.substring(timeStr.length),
				time = parseInt(timeStr, 10),
				check = parseInt(checkStr, 10),
				date = new Date();
			return (time % checkNum == check) ? time : null;
		},
		start: function () {
			if (this.endDate) {
				this.refresh();
				this.timer = setInterval(lib.bind(this.refresh, this), 1000);
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
		refresh: function () {
			var date = new Date(),
				time = Math.floor((this.endDate.getTime() - date.getTime()) / 1000);
				contentStr = this.getContentString(time);
			this.target.innerHTML = contentStr || '';
			if (time < 0) {
				this.stop();
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
			this.inputs = lib.array(document.getElementsByName(this.inputName));
			this.durationTime = this.getDurationTime(this.duration);
			this.inputs.forEach(function (input) {
				lib.addEventListener(input.form, 'submit', lib.bind(function (ev) {
					var time = Math.floor((new Date()).getTime() / 1000) + this.durationTime;
					input.value = time + this.getCheckString(time);
				}, this));
			}, this);
		},
		getCheckString: function (time) {
			var check = '' + (time %  checkNum);
			while (check.length < 4) {
				check = '0' + check;
			}
			return check;
		},
		getDurationTime: function (o) {
			var durationTime = 0,
				now = new Date(),
				periods = {},
				passed = false;
			['seconds', 'minutes', 'hours', 'days'].forEach(function (periodId) {
				var value = o[periodId];
				if (passed) {
					periods[periodId] =  value || 0;
				} else if (typeof value == 'number') {
					periods[periodId] = value + 1;
					passed = true;
				}
			});
			var date = new Date(now.getFullYear(), now.getMonth(),
				now.getDate() + periods.days,
				(typeof periods.hours == 'number') ? now.getHours() + periods.hours : 0,
				(typeof periods.minutes == 'number') ? now.getMinutes() + periods.minutes : 0,
				(typeof periods.seconds == 'number') ? now.getSeconds() + periods.seconds : 0);
			return Math.floor((date.getTime() - now.getTime()) / 1000);
		}
	};
	return {
		Form: Form,
		Timer: Timer,
		lib: lib
	};
})();

