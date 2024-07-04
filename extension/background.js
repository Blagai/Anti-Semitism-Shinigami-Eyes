chrome.runtime.onInstalled.addListener(() => {
	// Fetch anti-semitic data
	FetchAntiData();
	CreateContextMenu();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getBlockedDomains") {
		chrome.storage.local.get('AntiSem', data => {
			sendResponse(data.AntiSem || []);
		});
		return true; // Keeps the message channel open for sendResponse
	}
});

// Context menu click handling
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "WriteAnti") {
		WriteToAnti(info.linkUrl, tab.id);
	}
});

// Function to fetch data from the anti-semitic data file
function FetchAntiData() {
	fetch(chrome.runtime.getURL('data/anti.txt'))
	.then(response => response.text())
	.then(text => {
		const AntiSem = text.split('\n').map(domain => domain.trim()).filter(domain => domain.trim() !== '');
		chrome.storage.local.set({ AntiSem }, () => {
			console.log('Logged domains saved:', AntiSem);
		});
	})
	.catch(error => console.error('Error fetching domains:', error));
}

// Function to create context menu with required buttons
function CreateContextMenu() {
	chrome.contextMenus.create({
		id: "WriteAnti",
		title: "Mark as anti-semitic",
		contexts: ["link"]
	});
}

// Function to write marked link to anti-semitic data file
function WriteToAnti(linkUrl, tabId) {
	chrome.storage.local.get('AntiSem', data => {
		const AntiSem = data.AntiSem || [];
		if (!AntiSem.includes(linkUrl)) {
			AntiSem.push(linkUrl);
			chrome.storage.local.set({ AntiSem }, () => {
				console.log('updated domains saved:', AntiSem);
				chrome.tabs.reload(tabId);
			});
		}
	});
}