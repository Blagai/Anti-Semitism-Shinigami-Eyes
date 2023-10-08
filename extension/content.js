chrome.runtime.onInstalled.addListener(() => {
  // Read links from 1.txt and 2.txt
  const greenLinks = [];
  const redLinks = [];
  fetch(chrome.runtime.getURL("1.txt"))
    .then((response) => response.text())
    .then((text) => {
      greenLinks.push(...text.split("\n"));
    });
  fetch(chrome.runtime.getURL("2.txt"))
    .then((response) => response.text())
    .then((text) => {
      redLinks.push(...text.split("\n"));
    });

  // Listen for context menu item clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "markGreen") {
      if (greenLinks.includes(info.linkUrl)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            document.querySelector(`a[href="${info.linkUrl}"]`).style.color = "green";
          },
        });
      }
    } else if (info.menuItemId === "markRed") {
      if (redLinks.includes(info.linkUrl)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            document.querySelector(`a[href="${info.linkUrl}"]`).style.color = "red";
          },
        });
      }
    } else if (info.menuItemId === "clearHighlight") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          document.querySelector(`a[href="${info.linkUrl}"]`).style.color = "";
        },
      });
    }
  });

  // Create context menu items
  chrome.contextMenus.create({
    id: "markGreen",
    title: "Mark Green",
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "markRed",
    title: "Mark Red",
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "clearHighlight",
    title: "Clear Highlight",
    contexts: ["link"],
  });
});
