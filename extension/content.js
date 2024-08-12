// Function to change link colours of antisemitic sites
function changeToRed(AntiSem) {
	const links = document.querySelectorAll('a');

	links.forEach(link => {
		const href = link.getAttribute('href');
		if (href) {
			AntiSem.forEach(domain => {
				if (href.includes(domain) && !href.includes("/comments/")) {
					link.style.setProperty('color', 'red', 'important');
					
					const twitterElements = link.querySelectorAll('.css-146c3p1, .css-1jxf684');
					twitterElements.forEach(element => {
						element.style.setProperty('color', 'red', 'important');
					});
					
					const mediumElements = link.querySelectorAll('.am, .b');
					mediumElements.forEach(element => {
						element.style.setProperty('color', 'red', 'important');
					});
				}
			});
		}
	});
}

//Function to change link colours of friendly sites
function changeToGreen(JewFriend) {
	const flinks = document.querySelectorAll('a');
	
	flinks.forEach(link => {
		const fhref = link.getAttribute('href');
		if (fhref) {
			JewFriend.forEach(domain => {
				if (fhref.includes(domain) && !fhref.includes("/comments/")) {
					link.style.setProperty('color', 'green', 'important');
					
					const twitterElements = link.querySelectorAll('.css-146c3p1, .css-1jxf684');
					twitterElements.forEach(element => {
						element.style.setProperty('color', 'green', 'important');
					});
					
					const mediumElements = link.querySelectorAll('.am, .b');
					mediumElements.forEach(element => {
						element.style.setProperty('color', 'green', 'important');
					});
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "showAlert") {
		alert(request.message);
	}
});
