// Initialize an array to store friendly links.
let FriendlyUsers = [];

// Fetch the "data/friendly.txt" file.
fetch(chrome.runtime.getURL('data/friendly.txt'))
  .then((response) => response.text())
  .then((text) => {
    // Split the text into an array of links (assuming one link per line) and trim them.
    FriendlyUsers = text.split('\n').map((link) => link.trim());
    console.log('Friendly links loaded:', FriendlyUsers);
  })
  .catch((error) => {
    console.error('Error fetching "data/friendly.txt":', error);
  });


// Listen for messages from the content script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightLinks') {
    console.log('Content script requested friendly links.');
    sendResponse({
      action: 'highlightLinks',
      linksToHighlight: FriendlyUsers,
    });
  }
});
