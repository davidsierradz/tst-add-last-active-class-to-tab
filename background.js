'use strict'

const kTST_ID = 'treestyletab@piro.sakura.ne.jp';

async function registerToTST() {
    try {
        const self = await browser.management.getSelf();

        let success = await browser.runtime.sendMessage(kTST_ID, {
            type: 'register-self',
            name: self.id,
        });

        return success;
    }
    catch(e) {
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

registerToTST().then((res) => {
    browser.tabs.onActivated.addListener(callback);
    browser.tabs.onCreated.addListener(callback);
    browser.tabs.onRemoved.addListener(callback);
});

async function getSortedWinTabs() {
    const tabs = await browser.tabs.query({ currentWindow: true })
    tabs.sort((a, b) => (a.lastAccessed < b.lastAccessed ? 1 : -1))
    return tabs
}

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function callback() {
    await wait(300);

    const sortedTabs = await getSortedWinTabs();

    const allTabsIDs = sortedTabs.reduce((allIDs, currentTab) => {
        allIDs.push(currentTab.id);
        return allIDs;
    }, []);

    browser.runtime.sendMessage(kTST_ID, {
        type:  'remove-tab-state',
        tabs:  allTabsIDs,
        state: 'last-active',
    });

    browser.runtime.sendMessage(kTST_ID, {
        type:  'add-tab-state',
        tabs:  [sortedTabs[1].id],
        state: 'last-active',
    });
}
