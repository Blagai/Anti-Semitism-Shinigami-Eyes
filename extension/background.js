// TODO code this entire thing.

// Logic should be: Parse data files into sepearate arrays -> Get identifiers to solve from content script ->
// Check which dataset the identifiers belong to -> Send updated knowledge to content script to apply lables
var browser = browser || chrome;

let antiSet = new Set();
let friendlySet = new Set();

async function parseDataFiles() {
	const antiResponse = await fetch(chrome.runtime.getURL("/data/anti.dat"));
	const friendlyResponse = await fetch(chrome.runtime.getURL("/data/friendly.dat"));

	const antiText = await antiResponse.text();
	const friendlyText = await friendlyResponse.text();

	antiSet = new Set(antiText.split('\n').map(line => line.trim()).filter(Boolean));
	friendlySet = new Set(friendlyText.split('\n').map(line => line.trim()).filter(Boolean));
}

parseDataFiles();

let dataLoaded = false;
let loadPromise = parseDataFiles().then(() => {
	dataLoaded = true;
});

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.type === 'getLabels')
	{
		console.log("Received request for labels:", message.ids);

		if (!dataLoaded) await loadPromise;

		
		const result = {};

		for (const id of message.ids)
		{
			if (antiSet.has(id))
			{
				result[id] = 'antisemitic';
			}
			else if (friendlySet.has(id))
			{
				result[id] = 'jewfriend';
			}
			else
			{
				result[id] = '';
			}
		}

		sendResponse(result);
		return true;
	}
});