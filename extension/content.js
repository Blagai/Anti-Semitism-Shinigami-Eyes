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

//Function to change link colours of friendly sites
function changeToGreen(JewFriend) {
	const flinks = document.querySelectorAll('a');
	console.log(flinks);
	
	flinks.forEach(link => {
		const fhref = link.getAttribute('href');
		if (fhref) {
			JewFriend.forEach(domain => {
				if (fhref.includes(domain)) {
					link.style.color = 'green';
				}
			});
		}
	});
}

// Functiun to observer changes in the DOM
function observeDomChanges(AntiSem, JewFriend) {
	const observer = new MutationObserver(() => {
		changeToRed(AntiSem);
		changeToGreen(JewFriend);
	});
	
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	
	// Initial check
	changeToRed(AntiSem);
	changeToGreen(JewFriend);
}

// Fetch the AntiSem array from the background script
chrome.runtime.sendMessage({ action: "getBlockedDomains" }, (AntiSem) => {
	console.log('Blocked domains:', AntiSem);
	
	chrome.runtime.sendMessage({ action: "getFriendlyDomains" }, (JewFriend) => {
		console.log('Friendly domains saved:', JewFriend);
		
		observeDomChanges(AntiSem, JewFriend);
	});
});
