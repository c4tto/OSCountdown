OSCountdown.lib.addEventListener(window, 'load', function () {
	(new OSCountdown.Timer({
		targetClass: 'OSCountdownBanner',
		paramName: 'OSCountdownEnd',
		periodNames: {
			days: ['den', 'dny', 'dnů'],
			hours: ['hodina', 'hodiny', 'hodin'],
			minutes: ['minuta', 'minuty', 'minut'],
			seconds: ['sekunda', 'sekundy', 'sekund'],
		},
		templateHtml: '<div>' + 
						'<span>Vstup do Výzvy 21 dní se uzavře za:</span>' + 
						'<div>' +
							'<div><span class="label">{daysName}</span><span class="value">{days}</span></div>' +
							'<div><span class="label">{hoursName}</span><span class="value">{hours}</span></div>' +
							'<div><span class="label">{minutesName}</span><span class="value">{minutes}</span></div>' +
							'<div><span class="label">{secondsName}</span><span class="value">{seconds}</span></div>' +
						'</div>' +
					'</div>',
		expirationUrl: 'http://statnisprava.cz',
	})).start();
});
