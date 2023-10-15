import React, { useEffect, useState } from 'react';
import { getBucket } from '@extend-chrome/storage';
import { Button, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';

import { ShioriBucket } from '../shared/models/shioriNote';

const bucket = getBucket<ShioriBucket>('shiori', 'sync');

/**
 * @deprecated EditFormとSimpleInputの併用は、あまり良くないアイディアだと思うので、このコンポーネントは一旦非推奨にしておく。
 * メモを入力するためのコンポーネント
 */
export const SimpleInput = () => {
  const [isInputVisible, setInputVisible] = useState(false);
  const inputForm = useForm({
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
    const hostname = document.location.hostname;
    const pathname = document.location.pathname;
    const key = `${hostname}${pathname}`;
    const beforeVal = (await bucket.get((values: ShioriBucket) => values[key])) || {};
    console.log(`beforeVal: ${JSON.stringify(beforeVal)}`);
    console.log(`keys: ${JSON.stringify(await bucket.getKeys())}`);
    const newNote =
      beforeVal.note === undefined ? values.inputValue : beforeVal.note + '\n' + values.inputValue;

    // FIXME: ここにちゃんとデータを保存する処理を書く
    await bucket.set({
      [key]: {
        note: newNote,
        title: document.title,
        href: document.location.href,
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
        width: '40%',
        height: '60px',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        display: isInputVisible ? 'block' : 'none',
      }}
    >
      <form id="shiori-form" onSubmit={inputForm.onSubmit(handleSubmit)}>
        <Textarea
          id="shiori-input"
          placeholder="メモを入力してください。Ctrl + Enter で保存します。"
          size="lg"
          autosize
          minRows={10}
          maxRows={10}
          // styles={{ input: { height: '60px', fontSize: 20 } }}
          {...inputForm.getInputProps('inputValue')}
          autoFocus={true}
        />
        <Button id="shiori-form-button" type="submit" style={{ display: 'none' }} />
      </form>
    </div>
  );
};
