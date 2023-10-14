import { getBucket } from '@extend-chrome/storage';

import { translate } from '../app/translate';
import { ShioriBucket } from '../shared/models/shioriNote';

const bucket = getBucket<ShioriBucket>('my_bucket', 'sync');

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translation',
    title: '選択したテキストを翻訳',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined) {
    switch (info.menuItemId) {
      case 'translation': {
        const selectedText = info.selectionText !== undefined ? info.selectionText : '';
        const value = await bucket.get();
        const userTargetLang = value.targetLang ?? 'EN';
        const translatedText = await translate(selectedText, userTargetLang);
        console.log(translatedText);
        chrome.tabs.sendMessage(tab.id as number, {
          type: 'SHOW',
          data: {
            lang: userTargetLang,
            translatedText: translatedText,
            originalText: selectedText,
          },
        });
        break;
      }
    }
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'TRANSLATE') {
    const selectedText = message.data.selectionText ?? '';
    const value = await bucket.get();
    const userTargetLang = value.targetLang ?? 'EN';
    const translatedText = await translate(selectedText, userTargetLang);
    chrome.tabs.sendMessage(sender.tab?.id as number, {
      type: 'SHOW',
      data: {
        lang: userTargetLang,
        translatedText: translatedText,
        originalText: selectedText,
      },
    });
  }
});

export {};
