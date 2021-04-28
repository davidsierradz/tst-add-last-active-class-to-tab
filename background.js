'use strict';

const kTST_ID = 'treestyletab@piro.sakura.ne.jp';
let prevprevid = "";

async function registerToTST() {
  try {
    const self = await browser.management.getSelf();

    let success = await browser.runtime.sendMessage(kTST_ID, {
      type: 'register-self',
      name: self.id,
    });

    return success;
  } catch (e) {
    // TST is not available
  }
}

browser.runtime.onMessageExternal.addListener((aMessage, aSender) => {
  switch (aSender.id) {
    case kTST_ID:
      switch (aMessage.type) {
        case 'ready':
          registerToTST();
          break;
      }
      break;
  }
});

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

registerToTST().then(res => {
  browser.tabs.onActivated.addListener(callback);
  browser.tabs.onCreated.addListener(callback);
  browser.tabs.onRemoved.addListener(callback);
});

async function callback(activeInfo) {
		//await wait(50);
		if (activeInfo.tabId == undefined)
				return

		let a = await browser.tabs.get(activeInfo.tabId);

		if (prevprevid != "")	{
				let prevprevid_tab = await browser.tabs.get(prevprevid);
				browser.runtime.sendMessage(kTST_ID, {
						type: 'remove-tab-state',
						tabs: [prevprevid_tab],
						state: 'last-active',
				});
		}

		prevprevid = activeInfo.previousTabId;

		browser.runtime.sendMessage(kTST_ID, {
				type: 'add-tab-state',
				tabs: [activeInfo.previousTabId],
				state: 'last-active',
		});
}
