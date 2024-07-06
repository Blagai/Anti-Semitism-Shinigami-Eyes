const UserDomains = [
	"https://www.facebook.com/",
	"https://www.reddit.com/",
	"https://www.twitter.com/",
	"https://www.medium.com/",
	"https://www.tumblr.com/",
	"https://en.wikipedia.org/",
	"https://www.youtube.com/"
];

const ExcludedDomains = [
	"https://www.google.at/",
	"https://www.google.be/",
	"https://www.google.ca/",
	"https://www.google.ch/",
	"https://www.google.co.uk/",
	"https://www.google.com/",
	"https://www.google.de/",
	"https://www.google.dk/",
	"https://www.google.es/",
	"https://www.google.fi/",
	"https://www.google.fr/",
	"https://www.google.is/",
	"https://www.google.it/",
	"https://www.google.no/",
	"https://www.google.pt/",
	"https://www.google.se/",
	
	"https://www.bing.com/",
	"https://duckduckgo.com/"
];

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
	if (info.linkUrl.includes("www.youtube.com")) {
		if (!info.linkUrl.includes("www.youtube.com/@") && !info.linkUrl.includes("www.youtube.com/channel/")) {
			chrome.tabs.sendMessage(tab.id, { action: "showAlert", message: "Only mark channel links for the anti-semitism shinigami eyes extension" });
			return;
		}
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

// Function to send data to server
function sendData(filename, data) {
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
	const lastDotIndex = filename.lastIndexOf('.');
	const name = filename.substring(0, lastDotIndex);
	const extension = filename.substring(lastDotIndex);
	
	const uniqueFilename = `${filename}-${timestamp}${extension}`;
	
	fetch('https://flying-furtive-coin.glitch.me/upload', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ filename: uniqueFilename, data })
	})
	.then(response => response.text())
	.then(result => {
		console.log('Data successfully sent to server:', result);
	})
	.catch(error => {
		console.error('Error sending data to server:', error);
	});
}

// Function to get the base domain from a URL
function getBaseDomain(linkUrl) {
    try {
        const url = new URL(linkUrl);
        return `${url.protocol}//${url.hostname}/`;
    } catch (error) {
        console.error('Invalid URL:', linkUrl);
        return null;
    }
}

// Function to write marked link to anti-semitic data file
function WriteToAnti(linkUrl, tabId) {
	const baseDomain = getBaseDomain(linkUrl);
	chrome.storage.local.get('AntiSem', data => {
		const AntiSem = data.AntiSem || [];
		if (!UserDomains.includes(baseDomain) && !ExcludedDomains.includes(baseDomain)) {
			if (!AntiSem.includes(baseDomain)) {
				AntiSem.push(baseDomain);
				chrome.storage.local.set({ AntiSem }, () => {
					console.log('updated domains saved:', AntiSem);
				});
			}
		}
		else if (UserDomains.includes(baseDomain) && !ExcludedDomains.includes(baseDomain)) {
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
				else if (linkUrl.includes("https://www.facebook.com")) {
					const strippedFaceLink1 = linkUrl.replace(/(https:\/\/www\.facebook\.com\/groups\/\d+).*/, '$1');
					const strippedFaceLink2 = strippedFaceLink1.replace("https://www.facebook.com", '');
					
					AntiSem.push(strippedFaceLink1);
					chrome.storage.local.set({ AntiSem }, () => {
						console.log('Added facebook link', strippedFaceLink1);
					});
					
					AntiSem.push(strippedFaceLink2);
					chrome.storage.local.set({ AntiSem }, () => {
						console.log('Added facebook group', strippedFaceLink2);
					});
				}
				else if (linkUrl.includes("https://www.reddit.com")) {
					const strippedRedditLink = linkUrl.replace("https://www.reddit.com", '');
					
					AntiSem.push(strippedRedditLink);
					chrome.storage.local.set({ AntiSem }, () => {
						console.log('Added reddit link', strippedRedditLink);
					});
				}
				else if (linkUrl.includes("https://www.tumblr.com")) {
					const strippedTumblrLink = linkUrl.replace("https://www.tumblr.com", '');
					
					AntiSem.push(strippedTumblrLink);
					chrome.storage.local.set({ AntiSem }, () => {
						console.log('Added friendly tumblr link', strippedTumblrLink);
					});
				}
			}
		}
		sendData('anti.txt', AntiSem);
		chrome.tabs.reload(tabId);		
	});
}

// Function to write marked link to friendly data file
function WriteToFriendly(linkUrl, tabId) {
	const FbaseDomain = getBaseDomain(linkUrl);
	chrome.storage.local.get('JewFriend', data => {
		const JewFriend = data.JewFriend || [];
		
		if (!UserDomains.includes(FbaseDomain) && !ExcludedDomains.includes(FbaseDomain)) {
			if (!JewFriend.includes(FbaseDomain)) {
				JewFriend.push(FbaseDomain);
				chrome.storage.local.set({ JewFriend }, () => {
					console.log('updated friendlies saved:', JewFriend);
				});
			}
		}
		else if (UserDomains.includes(FbaseDomain) && !ExcludedDomains.includes(FbaseDomain)) {
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
				else if (linkUrl.includes("https://www.facebook.com")) {
					const FstrippedFaceLink1 = linkUrl.replace(/(https:\/\/www\.facebook\.com\/groups\/\d+).*/, '$1');
					const FstrippedFaceLink2 = FstrippedFaceLink1.replace("https://www.facebook.com", '');
					
					JewFriend.push(FstrippedFaceLink1);
					chrome.storage.local.set({ JewFriend }, () => {
						console.log('Added friendly facebook link', FstrippedFaceLink1);
					});
					
					JewFriend.push(FstrippedFaceLink2);
					chrome.storage.local.set({ JewFriend }, () => {
						console.log('Added friendly facebook group', FstrippedFaceLink2);
					});
				}
				else if (linkUrl.includes("https://www.reddit.com")) {
					const fStrippedRedditLink = linkUrl.replace("https://www.reddit.com", '');
					
					JewFriend.push(fStrippedRedditLink);
					chrome.storage.local.set({ JewFriend }, () => {
						console.log('Added friendly reddit link', fStrippedRedditLink);
					});
				}
				else if (linkUrl.includes("https://www.tumblr.com")) {
					const fStrippedTumblrLink = linkUrl.replace("https://www.tumblr.com", '');
					
					JewFriend.push(fStrippedTumblrLink);
					chrome.storage.local.set({ JewFriend }, () => {
						console.log('Added friendly tumblr link', fStrippedTumblrLink);
					});
				}
			}
		}
		sendData('friendly.txt', JewFriend);
		chrome.tabs.reload(tabId);
	});
}