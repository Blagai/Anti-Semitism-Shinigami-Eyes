// Function to change link colours of antisemitic sites
function changeToRed(AntiSem) {
	const links = document.querySelectorAll('a');
	console.log(links);

	links.forEach(link => {
		const href = link.getAttribute('href');
		if (href) {
			AntiSem.forEach(domain => {
				if (href.includes(domain)) {
					link.style.color = 'red';
				}
			});
		}
	});
}

// Functiun to observer changes in the DOM
function observeDomChanges(AntiSem) {
	const observer = new MutationObserver(() => {
		changeToRed(AntiSem);
	});
	
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	
	// Initial check
	changeToRed(AntiSem);
}

// Fetch the AntiSem array from the background script
chrome.runtime.sendMessage({ action: "getBlockedDomains" }, (AntiSem) => {
	console.log('Blocked domains:', AntiSem);
	observeDomChanges(AntiSem);
});
