import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  ActionIcon,
  Autocomplete,
  Button,
  CloseButton,
  Col,
  Container,
  Image,
  Paper,
  TextInput,
  Tooltip,
} from '@mantine/core';

import { Content } from './Content';

const Main = ({
  orect,
  translatedText,
  originalText,
  targetLang,
}: {
  orect: DOMRect;
  translatedText: string;
  originalText: string;
  targetLang: string;
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        left: window.scrollX + orect.left,
        top: window.scrollY + orect.bottom + 10,
        zIndex: 2147483550,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '10px', // 自由に変えて良い
          top: '10px', // 自由に変えて良い
          zIndex: 2147483550,
        }}
      >
        <Content
          translatedText={translatedText}
          originalText={originalText}
          targetLang={targetLang}
        />
      </div>
    </div>
  );
};

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  if (message.type === 'SHOW') {
    const selection = window.getSelection();
    if (selection !== undefined && selection !== null && selection.toString() !== undefined) {
      const oRange = selection.getRangeAt(0);
      const oRect = oRange.getBoundingClientRect();
      if (selection.toString().length === 0) {
        return;
      }
      if (document.getElementsByTagName('my-extension-root').length > 0) {
        document.getElementsByTagName('my-extension-root')[0].remove();
      }
      for (let i = 0; i < document.getElementsByTagName('my-extension-root-icon').length; i++) {
        document.getElementsByTagName('my-extension-root-icon')[i].remove();
      }
      const container = document.createElement('my-extension-root');
      document.body.after(container);
      createRoot(container).render(
        <Main
          orect={oRect}
          translatedText={message.data.translatedText.toString()}
          originalText={message.data.originalText.toString()}
          targetLang={message.data.lang.toString()}
        />
      );
    }
  }
});

/**
 * サンプルコードに載っていたが、不要なのでコメントアウトする
 */
// document.addEventListener('mouseup', () => {
//   const selection = window.getSelection();
//   if (selection === undefined || selection === null) {
//     return;
//   }
//   if (selection.toString().length > 0) {
//     const oRange = selection.getRangeAt(0);
//     const oRect = oRange.getBoundingClientRect();
//     if (document.getElementsByTagName('my-extension-root').length > 0) {
//       return;
//     }
//     for (let i = 0; i < document.getElementsByTagName('my-extension-root').length; i++) {
//       document.getElementsByTagName('my-extension-root')[i].remove();
//     }
//     const container = document.createElement('my-extension-root-icon');
//     document.body.after(container);
//     createRoot(container).render(<Icon selectedText={selection.toString()} orect={oRect} />);
//   }
// });

const Icon = ({ selectedText, orect }: { selectedText: string; orect: DOMRect }) => {
  const handleClick = async () => {
    for (let i = 0; i < document.getElementsByTagName('my-extension-root-icon').length; i++) {
      document.getElementsByTagName('my-extension-root-icon')[i].remove();
    }
    chrome.runtime.sendMessage({
      type: 'TRANSLATE',
      data: {
        selectionText: selectedText,
      },
    });
  };
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        left: '0px',
        top: '0px',
        zIndex: 2147483550,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: window.scrollX + orect.right,
          top: window.scrollY + orect.bottom,
          zIndex: 2147483550,
        }}
      >
        <Tooltip label="選択したテキストを翻訳" withArrow>
          <ActionIcon
            radius="xl"
            variant="default"
            size="lg"
            sx={{
              boxShadow: '0 0 10px rgba(0,0,0,.3);',
              zIndex: 2147483550,
            }}
            onClick={handleClick}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                zIndex: 2147483550,
              }}
            >
              <Image src={chrome.runtime.getURL('images/extension_128.png')} />
            </div>
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
};

// ctrl+iを押すとinputタグが画面の中央に表示される
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'i') {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '50%';
    div.style.left = '50%';
    div.style.width = '70%';
    div.style.height = '300px';
    div.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(div);

    // TODO: display flag的なものを持たせて、表示をトグルできるようにする
    const RootComponent = () => (
      <TextInput
        placeholder="Type your command"
        styles={{ input: { height: '60px', fontSize: 20 } }}
      />
    );

    createRoot(div).render(<RootComponent />);
  }
});
