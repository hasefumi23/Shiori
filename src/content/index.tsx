import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getBucket } from '@extend-chrome/storage';
import { ActionIcon, Button, Image, Textarea, TextInput, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';

import { Content } from './Content';

interface ShioriNote {
  note: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface MyBucket {
  [key: string]: ShioriNote;
}

const bucket = getBucket<MyBucket>('shiori', 'local');

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

// Div element will be stored here after first creation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// let div: any = null;
// ReactDOM root will be stored here after first creation
// let root = null;

const RootComponent = () => {
  const [isInputVisible, setInputVisible] = useState(false);
  const form = useForm({
    initialValues: {
      inputValue: '',
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        setInputVisible((visible) => !visible);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // inputタグが表示される度にフォーカスを当てる
  useEffect(() => {
    if (isInputVisible) {
      const inputElement = document.getElementById('shiori-input');
      inputElement && inputElement.focus();
    }
  }, [isInputVisible]);

  useEffect(() => {
    console.log('called.');
    const shoriInput = document.getElementById('shiori-input');
    if (!shoriInput) return;
    shoriInput.addEventListener('keydown', function (event) {
      if (event.ctrlKey && event.key === 'Enter') {
        const shioriForm = document.getElementById('shiori-form-button') as HTMLButtonElement;
        shioriForm && shioriForm.click();
      }
    });
  }, []);

  const handleSubmit = async (values: { inputValue: string }) => {
    // FIXME: 削除する
    const hostname = document.location.hostname;
    const pathname = document.location.pathname;
    const key = `${hostname}${pathname}`;
    const beforeVal = (await bucket.get((values: any) => values[key])) || '';
    console.log(`beforeVal: ${JSON.stringify(beforeVal)}`);
    console.log(`keys: ${JSON.stringify(await bucket.getKeys())}`);
    const newNote = beforeVal.note + '\n' + values.inputValue;

    // FIXME: ここにちゃんとデータを保存する処理を書く
    await bucket.set({
      [key]: {
        note: newNote,
        title: document.title,
        // FIXME: ここは、ちゃんと日付を扱うライブラリを導入する
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    console.log(newNote);
    values.inputValue = '';
    setInputVisible(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '250px',
        left: '50%',
        width: '60%',
        height: '6px',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        display: isInputVisible ? 'block' : 'none',
      }}
    >
      <form id="shiori-form" onSubmit={form.onSubmit(handleSubmit)}>
        <Textarea
          id="shiori-input"
          placeholder="Type your command"
          size="md"
          autosize
          minRows={2}
          maxRows={10}
          // styles={{ input: { height: '60px', fontSize: 20 } }}
          {...form.getInputProps('inputValue')}
          autoFocus={true}
        />
        <Button id="shiori-form-button" type="submit" style={{ display: 'none' }} />
      </form>
    </div>
  );
};

const container = document.createElement('shiori-root');
document.body.after(container);
createRoot(container).render(<RootComponent />);
