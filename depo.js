const configs = [{
	name: 'Payment gateway',
	desc: 'Pay through a provider',
	icon: '↗',
	min: 10,
	max: 30000,
	providers: ['VADERPAY', 'VADERPAY (C2)', 'PAY ESSENCE', 'BigPayz', 'SKLPAY', 'PayJom'],
	label: 'Payment provider',
	note: 'Continue to your payment provider',
	copy: 'You’ll leave this page to complete payment with your selected provider.',
	cta: 'Review payment'
}, {
	name: 'DuitNow QR',
	desc: 'Scan with your banking app',
	icon: '▦',
	min: 30,
	max: 10000,
	providers: ['VADERPAY (C1)', 'VADERPAY (C2)', 'EeziePay'],
	label: 'QR provider',
	note: 'Scan to pay',
	copy: 'A payment QR code is generated after you confirm your deposit details.',
	cta: 'Review QR deposit'
}, {
	name: 'Bank transfer',
	desc: 'Manual transfer',
	icon: '⇄',
	min: 20,
	max: 30000,
	providers: ['MAYBANK', 'ALLIANCE BANK', 'PUBLIC BANK'],
	label: 'Receiving bank',
	note: 'Transfer, then upload your receipt',
	copy: 'Get receiving account details first. Your transfer will need to be verified.',
	cta: 'Review bank transfer'
}, {
	name: 'E-wallet',
	desc: 'Pay with your wallet',
	icon: '▱',
	min: 30,
	max: 10000,
	providers: ['VADERPAY (C1)', 'A9Wallet', 'PAY ESSENCE', 'PayJom', 'BigPayz', 'EeziePay'],
	label: 'E-wallet provider',
	note: 'Continue to your wallet provider',
	copy: 'Choose your supported wallet on the provider’s payment page.',
	cta: 'Review e-wallet payment'
}, {
	name: 'Crypto',
	desc: 'USDT on your chosen network',
	icon: '₮',
	min: 5,
	max: 50000,
	providers: ['VADERPAY (C2)', 'TERRACOIN'],
	label: 'Crypto provider',
	note: 'Check your asset and network carefully',
	copy: 'Send only USDT on the selected network. A live quote and destination address are required before sending.',
	cta: 'Review crypto deposit'
}];
const gatewayRules = {
	'VADERPAY': {
		min: 30,
		max: 10000,
		bank: true
	},
	'VADERPAY (C2)': {
		min: 10,
		max: 10000,
		bank: true,
		channels: true
	},
	'PAY ESSENCE': {
		min: 10,
		max: 30000,
		bank: false
	},
	'BigPayz': {
		min: 20,
		max: 10000,
		bank: true
	},
	'SKLPAY': {
		min: 50,
		max: 10000,
		bank: true
	},
	'PayJom': {
		min: 20,
		max: 15000,
		bank: false
	}
};
const cryptoRules = {
	'VADERPAY (C2)': {
		min: 5,
		max: 50000,
		channels: true
	},
	'TERRACOIN': {
		min: 5,
		max: 50000
	}
};
const walletRules = {
	'VADERPAY (C1)': {
		min: 30,
		max: 10000,
		channels: ['FPX', 'DuitNow']
	},
	'A9Wallet': {
		min: 20,
		max: 10000
	},
	'PAY ESSENCE': {
		min: 10,
		max: 30000
	},
	'PayJom': {
		min: 20,
		max: 15000
	},
	'BigPayz': {
		min: 20,
		max: 10000
	},
	'EeziePay': {
		min: 40,
		max: 500,
		channels: ['Boost', 'GrabPay', 'Touch ’n Go eWallet', 'ShopeePay']
	}
};
const qrRules = {
	'VADERPAY (C1)': {
		min: 30,
		max: 10000
	},
	'VADERPAY (C2)': {
		min: 10,
		max: 10000,
		channels: true
	},
	'EeziePay': {
		min: 40,
		max: 500
	}
};
const bankLogos = {
	"Affin Bank": "affin",
	"AmBank": "ambank",
	"Bank Simpanan Nasional": "bsn",
	"Hong Leong Bank": "hong-leong",
	"Maybank": "maybank",
	"Public Bank Berhad": "public",
	"RHB Bank": "rhb",
	"CIMB Bank": "cimb",
	"Bank Islam": "islam",
	"Bank Rakyat": "rakyat",
	"Alliance Bank": "alliance",
	"OCBC Bank": "ocbc",
	"UOB Bank": "uob",
	"MAYBANK": "maybank",
	"ALLIANCE BANK": "alliance",
	"PUBLIC BANK": "public"
};

function bankLogo(name) {
	return bankLogos[name] ? `<span class="bank-logo-frame"><img class="bank-logo" src="imgs/assets/banks/${bankLogos[name]==='rhb'?'rhb-wordmark.png':bankLogos[name]==='cimb'?'cimb-current.svg':bankLogos[name]==='maybank'?'maybank-transparent.svg':bankLogos[name]+'.png'}" alt="" aria-hidden="true"></span>` : ""
}
const banks = ['Affin Bank', 'AmBank', 'Bank Simpanan Nasional', 'Hong Leong Bank', 'Maybank', 'Public Bank Berhad', 'RHB Bank', 'CIMB Bank', 'Bank Islam', 'Bank Rakyat', 'Alliance Bank', 'OCBC Bank', 'UOB Bank'];
let selectedBank = '',
	selectedChannel = '';

function currentConfig() {
	return method === 0 ? {
		...configs[0],
		...gatewayRules[provider]
	} : method === 1 ? {
		...configs[1],
		...qrRules[provider]
	} : method === 3 ? {
		...configs[3],
		...walletRules[provider]
	} : method === 4 ? {
		...configs[4],
		...cryptoRules[provider]
	} : configs[method]
}
const channelLogos = {
	'FPX': 'fpx',
	'DuitNow': 'duitnow',
	'Boost': 'boost',
	'GrabPay': 'grabpay',
	'Touch ’n Go eWallet': 'touch-n-go',
	'ShopeePay': 'shopeepay'
};

function channelLabel(ch) {
	return channelLogos[ch] ? `<span class="channel-identity"><img class="channel-logo" src="imgs/assets/channels/${channelLogos[ch]}-transparent.svg" alt="${ch}"></span>` : ch
}

function gatewayDetails() {
	if (![0, 1, 3, 4].includes(method)) return '';
	const rule = currentConfig();
	return `${rule.channels?`<div class="gateway-section"><span class="field-label">Choose a channel</span><div class="channel-options ${method===3?'wallet-tiles':''}" id="channel-control" aria-describedby="channel-error" role="group" aria-label="Gateway channel">${(Array.isArray(rule.channels)?rule.channels:['Channel 1','Channel 2','Channel 3']).map(ch=>`<button class="choice ${selectedChannel===ch?'selected':''}" data-channel="${ch}" aria-pressed="${selectedChannel===ch}">${channelLabel(ch)}<span class="radio-dot" aria-hidden="true"></span></button>`).join('')}</div></div>`:''}${rule.bank?`<div class="gateway-section"><span class="field-label">Choose your bank</span><p class="helper bank-helper">Select the bank you’ll pay from.</p><div class="bank-options" id="bank-control" aria-describedby="bank-error" role="group" aria-label="Your bank">${banks.map(b=>`<button class="choice ${selectedBank===b?'selected':''}" data-bank="${b}" aria-pressed="${selectedBank===b}"><span class="bank-identity">${bankLogo(b)}<span>${b}</span></span><span class="radio-dot" aria-hidden="true"></span></button>`).join('')}</div></div>`:''}`
}

function qrPreview(title) {
	return `<div class="qr-preview"><button type="button" class="qr-image-button" data-qr-title="${title}" aria-label="Enlarge ${title} placeholder"><img src="imgs/assets/qr-placeholder.svg" alt="QR image placeholder"><span class="qr-enlarge" aria-hidden="true">⤢</span></button><strong>${title}</strong></div>`
}

function cryptoDetails() {
	if (provider === 'TERRACOIN') return `<div class="gateway-section"><span class="field-label">TERRACOIN receiving details</span><div class="terra-address"><span class="helper">Destination address · Reference only</span><div><code>TQ3U1Zz3XX5AqKHzbMZkjJ4UZpQfKHLN2v</code><button class="copy-button" type="button" data-crypto-copy>Copy</button></div></div><div class="terra-quote"><span>Reference exchange rate</span><strong>1 TRC = MYR 2</strong></div><p class="helper">Rate reproduced from your reference. A live rate and confirmed asset/network are needed before payment.</p>${qrPreview('TERRACOIN payment QR')}<p id="crypto-copy-status" class="helper" role="status"></p></div>`;
	return `<div class="gateway-section"><span class="field-label">Choose a crypto network · USDT</span><div class="choices network-tiles" id="network-control" role="group" aria-label="Crypto network" aria-describedby="network-error"><button class="choice" data-network="TRC20"><span class="bank-logo-frame"><img class="bank-logo" src="imgs/assets/crypto/usdt.png" alt=""></span><strong>TRC20 · USDT</strong><small>Tron</small><span class="radio-dot" aria-hidden="true"></span></button><button class="choice" data-network="ERC20"><span class="bank-logo-frame"><img class="bank-logo" src="imgs/assets/crypto/ethereum.png" alt=""></span><strong>ERC20 · USDT</strong><small>Ethereum</small><span class="radio-dot" aria-hidden="true"></span></button></div><p class="helper">Use the same network when sending USDT. Your payment instructions will confirm the address and amount.</p></div>`
}
let receiptFile = null,
	receiptUrl = null;

function clearReceipt() {
	if (receiptUrl) URL.revokeObjectURL(receiptUrl);
	receiptUrl = null;
	receiptFile = null;
	$('receipt').value = '';
	$('receipt-preview').hidden = true;
	$('receipt-image').hidden = true;
	$('receipt-image').removeAttribute('src');
	$('receipt-status').textContent = '';
}

function acceptReceipt(file) {
	clearReceipt();
	$('receipt-error').textContent = '';
	if (!file) {
		update();
		return
	}
	if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
		$('receipt-error').textContent = 'Choose a JPG, PNG or PDF receipt.';
		update();
		return
	}
	if (file.size > 10 * 1024 * 1024 || file.size === 0) {
		$('receipt-error').textContent = 'Choose a non-empty receipt file smaller than 10 MB.';
		update();
		return
	}
	receiptFile = file;
	$('receipt-name').textContent = file.name;
	$('receipt-size').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB · ' + (file.type === 'application/pdf' ? 'PDF' : 'Image');
	$('receipt-preview').hidden = false;
	if (file.type.startsWith('image/')) {
		receiptUrl = URL.createObjectURL(file);
		$('receipt-image').src = receiptUrl;
		$('receipt-image').hidden = false
	}
	$('receipt-status').textContent = 'Receipt attached locally. Ready for request submission.';
	update()
}
const bonuses = [{
	name: 'No bonus',
	min: 0
}, {
	name: '2% Unlimited Reload Bonus (Free Spin)',
	min: 50
}, {
	name: 'Unlimited Casino Bonus 15% (MYR)',
	min: 100
}, {
	name: '10% Unlimited Slot Reload Bonus (MYR)',
	min: 50
}, {
	name: '10% Daily Deposit Bonus–Lottery Only',
	min: 30
}];
const bonusInfo = {
	0: {
		title: 'No Bonus'
	},
	1: {
		title: '2% Unlimited Reload Bonus (Free Spin)'
	},
	2: {
		title: 'Unlimited Casino Bonus 15% (MYR)'
	},
	3: {
		title: '10% Unlimited Slot Reload Bonus (MYR)'
	},
	4: {
		title: '10% Daily Deposit Bonus–Lottery Only'
	}
};

function bonusInfoMarkup(i) {
	const b = bonusInfo[i] || {
		title: bonuses[i].name
	};
	return `<span class="bonus-info" role="button" tabindex="0" data-bonus-info="${i}" aria-label="View information for ${b.title}"><img src="imgs/assets/info/icn-info.svg" alt=""></span>`
}

function bonusInfoDialog(i) {
	const b = bonusInfo[i] || {
		title: bonuses[i].name
	};
	const isNoBonus = i === 0;
	return `<div class="bonus-info-head"><h2 id="bonus-info-title" class="bonus-info-title">${b.title}</h2><button type="button" class="bonus-info-close" id="bonus-info-close" aria-label="Close bonus information">×</button></div><div class="bonus-info-stats"><div class="bonus-info-stat"><strong>Bonus</strong><span>${isNoBonus?'-':'2%'}</span></div><div class="bonus-info-stat"><strong>Rollover</strong><span>x5</span></div><div class="bonus-info-stat"><strong>Max Bonus</strong><span>${isNoBonus?'-':'88 MYR'}</span></div></div><section class="bonus-info-section"><h3>Eligible Product</h3><div class="bonus-info-icons ${isNoBonus?'no-bonus-products':''}"><div class="bonus-info-item"><img src="imgs/assets/info/icn-sport.svg" alt=""><span>Sport</span></div>${isNoBonus?'': '<div class="bonus-info-item"><img src="imgs/assets/info/icn-casino.svg" alt=""><span>Casino</span></div>'}<div class="bonus-info-item"><img src="imgs/assets/info/icn-games.svg" alt=""><span>Games</span></div>${isNoBonus?'': '<div class="bonus-info-item"><img src="imgs/assets/info/icn-lottery.svg" alt=""><span>Lottery</span></div>'}<div class="bonus-info-item"><img src="imgs/assets/info/icn-p2p.svg" alt=""><span>P2P</span></div></div></section><section class="bonus-info-section"><h3>Eligible For</h3><div class="bonus-info-icons three ${isNoBonus?'no-bonus-eligible':''}"><div class="bonus-info-item"><img src="imgs/assets/info/icn-freespin.svg" alt=""><span>Free<br>Spin</span></div>${isNoBonus?'': '<div class="bonus-info-item"><img src="imgs/assets/info/icn-luckyDraw.svg" alt=""><span>Lucky<br>Draw</span></div>'}<div class="bonus-info-item"><img src="imgs/assets/info/icn-deposit_reward.svg" alt=""><span>Deposit<br>Reward</span></div></div></section><section class="bonus-info-terms"><h3>Terms And Conditions</h3><p>This text from agent BO</p></section>`
}

let method = 0,
	provider = configs[0].providers[0],
	network = '',
	bonus = 0;
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('en-MY', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

function amount() {
	return Number($('amount').value)
}

function showDialog(title, copy) {
	$('dialog-title').textContent = title;
	$('dialog-copy').textContent = copy;
	$('dialog').showModal()
}

function render() {
	const c = currentConfig();
	$('wallet-limit-note').hidden = !(method === 3 && provider === 'EeziePay');
	$('methods').innerHTML = configs.map((m, i) => `<button class="method ${i===method?'active':''}" data-method="${i}" aria-pressed="${i===method}"><span class="icon" aria-hidden="true">${m.icon}</span><span><strong><span class="method-name-full">${m.name}</span><span class="method-name-short">${i===0?'Gateway':m.name}</span></strong><small>${m.desc}</small></span>${i===method?'<span class="indicator" aria-hidden="true">●</span>':''}</button>`).join('');
	$('qr-presets').hidden = false;
	$('qr-presets').innerHTML = [0, 1, 2, 3, 4].includes(method) ? [30, 50, 100, 200, 500, 1000].map(n => `<button class="preset" data-amount="${n}" aria-label="Add MYR ${n}" ${n<c.min||n>c.max?'disabled':''}>MYR ${n}</button>`).join('') : '';
	$('limits').textContent = `Per transaction: MYR ${c.min.toLocaleString()}–${c.max.toLocaleString()}`;
	$('specific').innerHTML = `<span class="field-label">${c.label}</span><div class="provider-options" role="group" aria-label="${c.label}">${c.providers.map(p=>`<button class="choice ${p===provider?'selected':''}" data-provider="${p}" aria-pressed="${p===provider}">${p}<span class="radio-dot" aria-hidden="true"></span></button>`).join('')}</div>${gatewayDetails()}${method===4?cryptoDetails():''}`;
	const manual = method === 2;
	$('manual-account').hidden = !manual;
	$('receiving-bank').textContent = provider;
	$('public-qr').hidden = !(manual && provider === 'PUBLIC BANK');
	$('copy-status').textContent = '';
	$('receipt-section').hidden = !manual;
	$('page-title').textContent = manual ? 'Submit a deposit request' : 'Make a deposit';
	$('page-description').textContent = manual ? 'Already transferred? Add your payment details for verification.' : 'Choose how you’d like to add funds.';
	$('amount-label').textContent = manual ? 'Amount paid' : 'Deposit amount';
	$('amount').setAttribute('aria-label', manual ? 'Amount already paid in MYR' : 'Deposit amount in MYR');
	$('amount-hint').textContent = manual ? 'Enter the exact MYR amount shown on your payment record.' : '';
	$('continue').textContent = 'Proceed';
	$('next-note').textContent = manual ? 'Your transfer request will be reviewed before the deposit is credited. In this preview, nothing is sent.' : method === 4 ? 'The final USDT amount and any fees are shown with the live quote.' : 'Payment instructions and any applicable fees are confirmed in the next step.';
	$('close').textContent = manual ? 'Back to request' : 'Back to deposit';
	update()
}
let validationAttempted = false;

function fieldErrors() {
	const c = currentConfig(),
		n = amount(),
		errors = {};
	if (!$('amount').value.trim()) errors.amount = 'Enter your deposit amount.';
	else if (!Number.isFinite(n) || n < c.min || n > c.max || !/^\d+(\.\d{0,2})?$/.test($('amount').value)) errors.amount = `Enter MYR ${c.min.toLocaleString()}–${c.max.toLocaleString()}, with up to 2 decimal places.`;
	if (c.bank && !selectedBank) errors.bank = 'Select the bank you’ll pay from.';
	if (c.channels && !selectedChannel) errors.channel = 'Select a payment channel.';
	if (method === 4 && provider === 'VADERPAY (C2)' && !network) errors.network = 'Select a crypto network.';
	if (method === 2) {
		if (!$('sender-name').value.trim()) errors.sender = 'Enter the sender’s full name.';
	}
	return errors;
}

function showValidation(focusFirst = false) {
	const errors = fieldErrors();
	const targets = {
		bank: 'bank-control',
		channel: 'channel-control',
		network: 'network-control',
		sender: 'sender-name',
		receipt: 'drop-zone',
		amount: 'amount-control'
	};
	let first = null;
	for (const [key, id] of Object.entries(targets)) {
		const control = $(id);
		if (!control) continue;
		const message = errors[key] || '';
		control.classList.toggle('field-invalid', !!message);
		const input = key === 'amount' ? $('amount') : key === 'receipt' ? $('receipt') : control;
		input.setAttribute('aria-invalid', !!message);
		let error = $(key + '-error');
		if (!error) {
			error = document.createElement('p');
			error.id = key + '-error';
			error.className = 'error field-error';
			error.setAttribute('role', 'status');
			control.insertAdjacentElement('afterend', error);
		}
		if (key !== 'receipt' || message || error.dataset.validation === 'true') {
			error.textContent = message;
			error.dataset.validation = message ? 'true' : 'false';
		}
		if (message && !first) first = key === 'amount' ? $('amount') : key === 'receipt' ? $('receipt') : control.querySelector('button') || control;
	}
	if (focusFirst && first) first.focus();
	return Object.keys(errors).length === 0;
}

function clearValidation() {
	document.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
	document.querySelectorAll('[aria-invalid="true"]').forEach(el => el.setAttribute('aria-invalid', 'false'));
	['bank', 'channel', 'network', 'sender', 'receipt', 'amount'].forEach(key => {
		const el = $(key + '-error');
		if (el) {
			el.textContent = '';
			if (el.dataset) el.dataset.validation = 'false';
		}
	});
}

function updateSummary() {
	const c = currentConfig(),
		n = amount();
	$('summary-method').textContent = c.name;
	$('summary-receiving').hidden = method !== 2;
	$('summary-receiving').innerHTML = method === 2 ? `<span>Receiving account:</span><span class="summary-copy-row"><span>JH AUTO MOBILE</span><button type="button" class="copy-button" data-copy="JH AUTO MOBILE" data-copy-label="account name" data-copy-status="summary-copy-status" aria-label="Copy receiving account name">Copy</button></span><span class="summary-copy-row"><span>560102718204</span><button type="button" class="copy-button" data-copy="560102718204" data-copy-label="account number" data-copy-status="summary-copy-status" aria-label="Copy receiving account number">Copy</button></span>` : '';
	$('summary-copy-status').textContent = '';
	const route = [provider];
	if (c.bank) route.push(selectedBank || 'Bank not selected');
	if (c.channels) route.push(selectedChannel || 'Channel not selected');
	if (method === 4 && provider === 'VADERPAY (C2)') route.push(network ? 'USDT · ' + network : 'Network not selected');
	$('summary-route').textContent = route.join(' · ');
	const bonusLabels = ['No bonus', '2% reload bonus', '15% casino bonus', '10% slot reload bonus', '10% lottery bonus'];
	$('summary-extra').textContent = bonusLabels[bonus] + (method === 2 ? (receiptFile ? ' · Receipt attached' : ' · No receipt attached') : '');
	$('summary-amount').textContent = 'MYR ' + ($('amount').value.trim() && Number.isFinite(n) && n > 0 ? fmt(n) : '—');
}

function update() {
	$('sender-name').setAttribute('aria-required', method === 2);
	const c = currentConfig(),
		n = amount(),
		valid = Number.isFinite(n) && n >= c.min && n <= c.max && /^\d+(\.\d{0,2})?$/.test($('amount').value);
	$('amount-error').textContent = valid || !$('amount').value ? '' : `Enter an amount from MYR ${c.min.toLocaleString()} to MYR ${c.max.toLocaleString()}, with up to 2 decimal places.`;
	$('amount').setAttribute('aria-invalid', !!$('amount').value && !valid);
	$('continue').disabled = false;
	if (n < bonuses[bonus].min) bonus = 0;
	const visibleBonuses = bonuses.map((b, i) => ({
		b,
		i
	}));
	$('bonus').innerHTML = visibleBonuses.map(({
		b,
		i
	}) => `<button class="choice bonus-choice ${i===bonus?'selected':''}" data-bonus="${i}" aria-pressed="${i===bonus}" ${n<b.min?'disabled':''}><span class="bonus-name"><span class="bonus-name-text">${b.name}</span>${bonusInfoMarkup(i)}</span>${b.min?'<small>Minimum MYR '+b.min+'</small>':''}<span class="radio-dot" aria-hidden="true"></span></button>`).join('');
	document.querySelectorAll('[data-network]').forEach(b => {
		b.classList.toggle('selected', b.dataset.network === network);
		b.setAttribute('aria-pressed', b.dataset.network === network)
	});
	$('bonus-note').textContent = bonus === 2 ? 'Deposit MYR 30 get 1 Free Spin | up to 3 Free spin.' : '';
	updateSummary();
	if (validationAttempted) showValidation();
}
document.addEventListener('click', async e => {
	const bonusInfoButton = e.target.closest('[data-bonus-info]');
	if (bonusInfoButton) {
		const i = Number(bonusInfoButton.dataset.bonusInfo),
			dialog = $('bonus-info-dialog');
		dialog.innerHTML = bonusInfoDialog(i);
		dialog.showModal();
		$('bonus-info-close').onclick = () => dialog.close();
		return;
	}
	const qr = e.target.closest('[data-qr-title]');
	if (qr) {
		$('qr-dialog-title').textContent = qr.dataset.qrTitle;
		$('qr-dialog').showModal();
		return;
	}
	const cryptoCopy = e.target.closest('[data-crypto-copy]');
	if (cryptoCopy) {
		try {
			await navigator.clipboard.writeText('TQ3U1Zz3XX5AqKHzbMZkjJ4UZpQfKHLN2v');
			$('crypto-copy-status').textContent = 'Reference address copied.'
		} catch {
			$('crypto-copy-status').textContent = 'Select and copy the address above.'
		}
		return;
	}
	const copy = e.target.closest('[data-copy]');
	if (copy) {
		const status = $(copy.dataset.copyStatus || 'copy-status');
		try {
			await navigator.clipboard.writeText(copy.dataset.copy);
			status.textContent = 'Copied ' + (copy.dataset.copyLabel || (copy.dataset.copy === 'JH AUTO MOBILE' ? 'account name' : 'account number')) + '.';
		} catch {
			status.textContent = 'Clipboard unavailable. Select and copy the account details.'
		}
		return;
	}
	const pb = e.target.closest('[data-provider]'),
		bb = e.target.closest('[data-bonus]');
	if (pb) {
		provider = pb.dataset.provider;
		network = '';
		selectedBank = '';
		selectedChannel = '';
		render();
		document.querySelector(`[data-provider="${provider}"]`).focus()
	}
	const bankButton = e.target.closest('[data-bank]'),
		channelButton = e.target.closest('[data-channel]');
	if (bankButton || channelButton) {
		if (bankButton) selectedBank = bankButton.dataset.bank;
		if (channelButton) selectedChannel = channelButton.dataset.channel;
		document.querySelectorAll('[data-bank],[data-channel]').forEach(b => {
			const active = b.dataset.bank ? b.dataset.bank === selectedBank : b.dataset.channel === selectedChannel;
			b.classList.toggle('selected', active);
			b.setAttribute('aria-pressed', active)
		});
		update()
	}
	if (bb) {
		bonus = Number(bb.dataset.bonus);
		update();
		document.querySelector(`[data-bonus="${bonus}"]`).focus()
	}
	const m = e.target.closest('[data-method]'),
		a = e.target.closest('[data-amount]'),
		net = e.target.closest('[data-network]');
	if (m) {
		validationAttempted = false;
		clearValidation();
		method = Number(m.dataset.method);
		network = '';
		selectedBank = '';
		selectedChannel = '';
		provider = configs[method].providers[0];
		render();
		document.querySelector(`[data-method="${method}"]`).focus()
	}
	if (a && !a.disabled) {
		const value = $('amount').value.trim();
		if (value && !/^\d+(\.\d{0,2})?$/.test(value)) {
			update();
			$('amount').focus();
			return;
		}
		const cents = Math.round(Number(value || 0) * 100) + Math.round(Number(a.dataset.amount) * 100);
		if (!Number.isSafeInteger(cents)) {
			update();
			$('amount').focus();
			return;
		}
		$('amount').value = (cents / 100).toFixed(2);
		update()
	}
	if (net) {
		network = net.dataset.network;
		update()
	}
});
$('sender-name').oninput = update;
$('amount').oninput = update;

function updatePromo() {
	const code = $('promo').value.trim();
	$('promo-control').classList.toggle('promo-active', !!code);
	$('promo-note').textContent = code ? 'Promo code “' + code + '” applied.' : '';
}
$('promo').oninput = updatePromo;
$('continue').onclick = () => {
	validationAttempted = true;
	if (!showValidation(true)) return;
	const c = currentConfig();
	if (method === 2) {
		showDialog('Deposit request preview', `MYR ${fmt(amount())} transferred by ${$('sender-name').value.trim()} to ${provider}, JH AUTO MOBILE, account 560102718204. ${receiptFile?'Receipt attached: '+receiptFile.name+'.':'No receipt attached.'} In the live service, this request would be sent for verification. This prototype has not uploaded your receipt or submitted a request.`)
	} else {
		showDialog('Review your deposit', `MYR ${fmt(amount())} via ${provider}${method===0&&c.bank?' · '+selectedBank:''}${(method===0||method===1||method===3||method===4)&&c.channels?' · '+selectedChannel:''}${method===4?(provider==='TERRACOIN'?' · Reference rate: 1 TRC = MYR 2 (not a live quote)':' · USDT on '+network):''}. ${method===4&&provider==='TERRACOIN'?'The payment service must confirm the asset, network, destination and live rate before transfer.':c.copy} This is a design preview; no payment has been initiated.`)
	}
};
$('bonus-info-close').onclick = () => $('bonus-info-dialog').close();
document.addEventListener('keydown', e => {
	const info = e.target.closest('[data-bonus-info]');
	if (info && (e.key === 'Enter' || e.key === ' ')) {
		e.preventDefault();
		$('bonus-info-dialog').innerHTML = bonusInfoDialog(Number(info.dataset.bonusInfo));
		$('bonus-info-dialog').showModal();
		$('bonus-info-close').onclick = () => $('bonus-info-dialog').close();
	}
});
$('bonus-info-dialog').addEventListener('click', e => {
	if (e.target === $('bonus-info-dialog')) $('bonus-info-dialog').close()
});
$('qr-close').onclick = () => $('qr-dialog').close();
$('qr-dialog').addEventListener('click', e => {
	if (e.target === $('qr-dialog')) {
		const r = $('qr-dialog').getBoundingClientRect();
		if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('qr-dialog').close()
	}
});
$('close').onclick = () => $('dialog').close();
$('receipt').onchange = e => acceptReceipt(e.target.files[0]);
$('remove-receipt').onclick = () => {
	clearReceipt();
	$('receipt-error').textContent = '';
	$('receipt-status').textContent = 'Receipt removed.';
	update();
	$('receipt').focus()
};
['dragenter', 'dragover'].forEach(event => $('drop-zone').addEventListener(event, e => {
	e.preventDefault();
	$('drop-zone').classList.add('dragging')
}));
['dragleave', 'drop'].forEach(event => $('drop-zone').addEventListener(event, e => {
	e.preventDefault();
	$('drop-zone').classList.remove('dragging')
}));
$('drop-zone').addEventListener('drop', e => {
	if (e.dataTransfer.files.length !== 1) {
		$('receipt-error').textContent = 'Attach one receipt at a time.';
		return
	}
	acceptReceipt(e.dataTransfer.files[0])
});
render();