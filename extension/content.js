var browser = browser || chrome;

var hostname = typeof (location) != 'undefined' ? location.hostname : '';
if (hostname.startsWith('www.')) {
    hostname = hostname.substring(4);
}
if (hostname.endsWith('.reddit.com')) hostname = 'reddit.com';
if (hostname == 'mobile.twitter.com' || hostname == 'mobile.x.com' || hostname == 'x.com') hostname = 'twitter.com';

var knownLabels = {};
var labelsToSolve = [];


function ColourLinks()
{
	document.querySelectorAll('a').forEach(link => {
		initLink(link);
	});

	solvePendingLabels();

	var observer = new MutationObserver(mutationsList => {
		for (const mutation of mutationsList) {
			if (mutation.type == 'childList') {
				for (const node of mutation.addedNodes) {
					if (node instanceof HTMLAnchorElement) {
						initLink(node);
					}
					if (node instanceof HTMLElement) {
						for (const subnode of node.querySelectorAll('a')) {
							initLink(subnode);
						}
					}
				}
			}
		}
		solvePendingLabels();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
}

function initLink(a)
{
	var identifier = getIdentifier(a);
	if (!identifier)
	{
		if (hostname == 'twitter.com') applyLabel(a, '');
		return;
	}

	var label = knownLabels[identifier];
	if (label === undefined)
	{
		labelsToSolve.push({ element: a, identifier: identifier });
		return;
	}
	applyLabel(a, identifier);
}

function applyLabel(a, identifier)
{
	if (a.assignedCssLabel)
	{
		a.classList.remove('assigned-label-' + a.assignedCssLabel);
		a.classList.remove('has-assigned-label');
	}

	a.assignedCssLabel = knownLabels[identifier] || '';

	if (a.assignedCssLabel)
	{
		a.classList.add('assigned-label-' + a.assignedCssLabel);
		a.classList.add('has-assigned-label');
		if (hostname == 'twitter.com') a.classList.remove('u-textInheritColor');
	}
}

function solvePendingLabels()
{
	if (!labelsToSolve.length) return;

	var uniqueIdentifiers = Array.from(new Set(labelsToSolve.map(x => x.identifier)));
	var toSolve = labelsToSolve;
	labelsToSolve = [];

	browser.runtime.sendMessage({ type: 'getLabels', ids: uniqueIdentifiers}, (response) => {
		for (const item of toSolve)
		{
			const label = response[item.identifier];
			knownLabels[item.identifier] = label || '';
			applyLabel(item.element, item.identifier);
			console.log("Applied label for identifier:", item.identifier, "Label:", label);
		}
	});
}

function getIdentifier(link) {
	try {
		var k = link instanceof Node ? getIdentifierFromElementImpl(link) : getIdentifierFromURLImpl(tryParseUrl(link));
		if (!k || k.indexOf('!') != -1) return null;
		return k.toLowerCase();
	} catch (e) {
		console.warn("Error getting identifier for " + link);
		return null;
	}
}

function getIdentifierFromElementImpl(element)
{
	if (!element) return null;

	const dataset = element.dataset;

	if (hostname == 'reddit.com') {
		/* const href = element.getAttribute('href');
		if (href && href.startsWith('/r/'))
		{
			const parts = href.split('/');
			if (parts.length >= 3 && parts[2])
			{
				return `reddit.com/r/${parts[2]}`;
			}
			return null;
		}
		*/

		const parent = element.parentElement;
		if (parent && parent.classList.contains('domain') && element.textContent.startsWith('self.')) return null;
	}
	else if (hostname == 'twitter.com')
	{
		if (dataset && dataset.expandedUrl) return getIdentifier(dataset.expandedUrl);
		if (element.href.startsWith('https://t.co/'))
		{
			const title = element.title;
			if (title && (title.startsWith('http://') || title.startsWith('https://'))) return getIdentifier(title);
			const content = element.textContent;
			if (!content.includes(' ') && content.includes('.') && !content.includes('...'))
			{
				const url = content.startsWith('http://') || content.startsWith('https://') ? content : 'http://' + content;
				return getIdentifier(url);
			}
		}
	}

	const href = element.href;
	if (href && (!href.endsWith('#') || href.includes('&stick='))) return getIdentifierFromURLImpl(tryParseUrl(href));
	return null;
}

function tryParseUrl(urlstr)
{
	if (!urlstr) return null;
	try {
		const url = new URL(urlstr);
		if (url.protocol != 'http:' && url.protocol != 'https:') return null;
		return url;
	} catch (e) {
		return null;
	}
}

function getIdentifierFromURLImpl(url)
{
	const identifier = getIdentifierFromUrlIgnoreBridges(url);
	return identifier;
}

function getIdentifierFromUrlIgnoreBridges(url)
{
	if (!url) return null;

	let host = url.hostname;
	const searchParams = url.searchParams;

	if (host.startsWith('www.')) host = host.substring(4);

	if (domainIs(host, 'reddit.com'))
	{
		const pathname = url.pathname.replace('/u/', '/user/');
		if (!pathname.startsWith('/user/') && !pathname.startsWith('/r/')) return null;
		if (pathname.includes('/comments/') && hostname == 'reddit.com') return null;
		return 'reddit.com' + getPartialPath(pathname, 2);
	}
	else if (domainIs(host, 'twitter.com') || domainIs(host, 'x.com'))
	{
		return 'twitter.com' + getPartialPath(url.pathname, 1);
	}
	return null;
}

function domainIs(host, baseDomain) {
    if (baseDomain.length > host.length) return false;
    if (baseDomain.length == host.length) return baseDomain == host;
    var k = host.charCodeAt(host.length - baseDomain.length - 1);
    if (k == 0x2E /* . */) return host.endsWith(baseDomain);
    else return false;
}

function getPartialPath(path, num)
{
	var m = path.split('/')
	m = m.slice(1, 1 + num);
	if (m.length && !m[m.length - 1]) m.length--;
	if (m.length != num) return '!!'
	return '/' + m.join('/');
}

ColourLinks();