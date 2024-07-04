chrome.runtime.onInstalled.addListener(() => {
	fetch(chrome.runtime.getURL('data/anti.txt'))
	.then(response => response.text())
	.then(text => {
		const AntiSem = text.split('\n').map(domain => domain.trim()).filter(domain => domain.trim() !== '');
		chrome.storage.local.set({ AntiSem }, () => {
			console.log('Logged domains saved:', AntiSem);
		});
	})
	.catch(error => console.error('Error fetching domains:', error));
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getBlockedDomains") {
		chrome.storage.local.get('AntiSem', data => {
			sendResponse(data.AntiSem || []);
		});
		return true; // Keeps the message channel open for sendResponse
	}
});
