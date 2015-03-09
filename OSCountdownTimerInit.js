OSCountdown.lib.addEventListener(window, 'load', function () {
	var lib = OSCountdown.lib,
		lastChanceCookieName = 'OSCountdownLastChance',
		lastChanceCookieValue = 'used';

		(new OSCountdown.Timer({
			paramName: 'OSCountdownEnd',
			periodNames: {
				days: ['den', 'dny', 'dní'],
				hours: ['hodina', 'hodiny', 'hodin'],
				minutes: ['minuta', 'minuty', 'minut'],
				seconds: ['sekunda', 'sekundy', 'sekund'],
			},
			templateHtml: '<a href="http://statnisprava.cz">' + 
							'<span class="title">Vstup do Výzvy 21 dní se uzavře za:</span>' + 
							'<div class="timer">' +
								'<div><span class="label">{daysName}</span><span class="value">{days}</span></div>' +
								'<div><span class="label">{hoursName}</span><span class="value">{hours}</span></div>' +
								'<div><span class="label">{minutesName}</span><span class="value">{minutes}</span></div>' +
								'<div><span class="label">{secondsName}</span><span class="value">{seconds}</span></div>' +
							'</div>' +
						'</a>',
			updateCallback: function (time, endDate) {
				if (lib.getCookie(lastChanceCookieName) == lastChanceCookieValue) {
					location = this.expirationUrl;
				}
			},
			expirationCallback: function (endDate) {
				if (lib.getCookie(lastChanceCookieName) != lastChanceCookieValue) {
					lib.setCookie(lastChanceCookieName, lastChanceCookieValue, {
						expires: {
							days: 30
						}
					});
					this.setEndDate(lib.addToDate(new Date(), {
						hours: 1,
						seconds: 0
					}));
				}
			},
			expirationUrl: 'lastChance.html'
		})).start();
});
