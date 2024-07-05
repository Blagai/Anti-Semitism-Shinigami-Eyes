chrome.runtime.onInstalled.addListener(() => {
	FetchAntiData();
	FetchFriendlyData();
	CreateContextMenu();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getBlockedDomains") {
		chrome.storage.local.get('AntiSem', data => {
			sendResponse(data.AntiSem || []);
		});
		return true; // Keeps the message channel open for sendResponse
	} else if (request.action === "getFriendlyDomains") {
		chrome.storage.local.get('JewFriend', data => {
			sendResponse(data.JewFriend || []);
		});
		return true;
	}
});

// Context menu click handling
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (!info.linkUrl.includes("www.youtube.com/@") || !info.linkUrl.includes("www.youtube.com/channel/")) {
		chrome.tabs.sendMessage(tab.id, { action: "showAlert", message: "Only mark channel links for the anti-semitism shinigami eyes extension" });
		return;
	}
	if (info.menuItemId === "WriteAnti") {
		WriteToAnti(info.linkUrl, tab.id);
	}
	if (info.menuItemId === "WriteFriendly") {
		WriteToFriendly(info.linkUrl, tab.id);
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

// Function to fetch data from the friendly data file
function FetchFriendlyData() {
	fetch(chrome.runtime.getURL('data/friendly.txt'))
	.then(response => response.text())
	.then(text => {
		const JewFriend = text.split('\n').map(domain => domain.trim()).filter(domain => domain.trim() !== '');
		chrome.storage.local.set({ JewFriend }, () => {
			console.log('friendly domains saved:', JewFriend);
		});
	})
	.catch(error => console.error('Error fetching friends:', error));
}

// Function to create context menu with required buttons
function CreateContextMenu() {
	chrome.contextMenus.create({
		id: "WriteAnti",
		title: "Mark as anti-semitic",
		contexts: ["link"]
	});
	
	chrome.contextMenus.create({
		id: "WriteFriendly",
		title: "Mark as Jewish-friendly",
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
			});
			if (linkUrl.includes("https://en.wikipedia.org")) {
				const strippedWikiLink = linkUrl.replace("https://en.wikipedia.org", '');
				
				AntiSem.push(strippedWikiLink);
				chrome.storage.local.set({ AntiSem }, () => {
					console.log('Added wiki link', strippedWikiLink);
				});
			}
			else if (linkUrl.includes("https://www.youtube.com")) {
				const strippedTubeLink = linkUrl.replace("https://www.youtube.com", '');
				
				AntiSem.push(strippedTubeLink);
				chrome.storage.local.set({ AntiSem }, () => {
					console.log('Added youtube link', strippedTubeLink);
				});
			}
			chrome.tabs.reload(tabId);
		}
	});
}

// Function to write marked link to friendly data file
function WriteToFriendly(linkUrl, tabId) {
	chrome.storage.local.get('JewFriend', data => {
		const JewFriend = data.JewFriend || [];
		if (!JewFriend.includes(linkUrl)) {
			JewFriend.push(linkUrl);
			chrome.storage.local.set({ JewFriend }, () => {
				console.log('updated friendlies saved:', JewFriend);
			});
			if (linkUrl.includes("https://en.wikipedia.org")) {
				const fStrippedWikiLink = linkUrl.replace("https://en.wikipedia.org", '');
				
				JewFriend.push(fStrippedWikiLink);
				chrome.storage.local.set({ JewFriend }, () => {
					console.log('Added friendly wiki link:', fStrippedWikiLink);
				});
			}
			else if (linkUrl.includes("https://www.youtube.com")) {
				const fStrippedTubeLink = linkUrl.replace("https://www.youtube.com", '');
				
				JewFriend.push(fStrippedTubeLink);
				chrome.storage.local.set({ JewFriend }, () => {
					console.log('Added friendly youtube link:', fStrippedTubeLink);
				});
			}
			chrome.tabs.reload(tabId);
		}
	});
}