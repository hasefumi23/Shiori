import React, { useEffect, useState } from 'react';
import { getBucket } from '@extend-chrome/storage';
import { Button, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';

import { ShioriBucket } from '../shared/models/shioriNote';
import { getThisPageShiori, getThisPageShioriKey, newShiori } from '../shared/utils/shioriUtil';

const bucket = getBucket<ShioriBucket>('shiori', 'sync');

export const EditNote = () => {
  const editForm = useForm({
    initialValues: {
      note: '',
    },
  });

  const [isInputVisible, setInputVisible] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        if (!isInputVisible) {
          // 非表示状態から表示された場合は、選択されているテキストを挿入する
          const selectedText = window.getSelection()?.toString();
          if (selectedText !== '') {
            // editFormから値が取れないので、素のjsで値を取得する
            const inputNote = document.getElementById('shiori-edit')?.textContent || '';
            editForm.setValues({ note: inputNote + '\n\n>' + selectedText });
          }
        }
        setInputVisible((visible) => !visible);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // inputタグが表示される度にフォーカスを当てる
  useEffect(() => {
    if (isInputVisible) {
      const inputElement = document.getElementById('shiori-edit');
      inputElement && inputElement.focus();
    }
  }, [isInputVisible]);

  useEffect(() => {
    const shoriInput = document.getElementById('shiori-edit');
    if (!shoriInput) return;
    shoriInput.addEventListener('keydown', function (event) {
      if (event.ctrlKey && event.key === 'Enter') {
        const shioriForm = document.getElementById('shiori-edit-form-button') as HTMLButtonElement;
        shioriForm && shioriForm.click();
      }
    });
  }, []);

  const handleSubmit = async (values: { note: string }) => {
    const key = getThisPageShioriKey();
    let currentShiori = await getThisPageShiori();
    if (currentShiori === undefined) {
      currentShiori = newShiori();
    }
    console.log(`currentShiori: ${JSON.stringify(currentShiori)}`);
    const newNote = values.note;
    console.log(`newNote: ${newNote}`);

    await bucket.set({
      [key]: { ...currentShiori, note: newNote },
    });
    setInputVisible(false);
  };

  // bucketから初期値を取得する処理はawaitを使う必要があるので、useEffectを使う
  useEffect(() => {
    const getInitVal = async () => {
      const shiori = await getThisPageShiori();
      const note = shiori?.note || '';
      // https://mantine.dev/form/values/#setinitialvalues-handler に従う
      editForm.setInitialValues({ note: note });
      editForm.setValues({ note: note });
    };
    getInitVal();
    // https://mantine.dev/form/values/#setinitialvalues-handler に従って、第二引数に空配列を指定する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <form id="shiori-edit-form" onSubmit={editForm.onSubmit(handleSubmit)}>
        <Textarea
          style={{
            input: { width: '100% !important' },
          }}
          id="shiori-edit"
          placeholder="編集してください。Ctrl + Enter で保存します。"
          minRows={10}
          maxRows={20}
          autosize
          {...editForm.getInputProps('note')}
          autoFocus={true}
        />
        <Button id="shiori-edit-form-button" type="submit" style={{ display: 'none' }} />
      </form>
    </div>
  );
};