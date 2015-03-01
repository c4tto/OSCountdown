OSCountdown.lib.addEventListener(window, 'load', function () {
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
		expirationCallback: function (endDate) {
			this.setEndDate(OSCountdown.lib.getDateByAddingPeriods(endDate, {
				hours: 1,
				seconds: 0
			}));
		},
		expirationUrl: 'index2.html'
	})).start();
});
