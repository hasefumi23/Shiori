import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';

import {
  getOrCreateShioriNote,
  getThisPageShiori,
  getThisPageShioriKey,
  newShioriNote,
  saveShioriNote,
} from '../shared/utils/shioriUtil';

export const EditNote = () => {
  // 入力値の状態を管理するための state と setter
  const [inputValue, setInputValue] = useState('');
  // bucketから取得した値を初期値として設定する
  useEffect(() => {
    const getInitVal = async () => {
      const key = getThisPageShioriKey();
      // このページのShioriが存在しない場合は、新規に作成する
      const shiori = await getOrCreateShioriNote(key);
      const note = shiori.note;
      setInputValue(note);
    };
    getInitVal();
  }, []);

  // フォームの表示状態を管理するための state と setter
  const [isInputVisible, setInputVisible] = useState(false);

  useEffect(() => {
    // TODO: この辺、mantineのhookを使って書きたい
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        if (!isInputVisible) {
          // 非表示状態から表示された場合は、選択されているテキストを挿入する
          const selectedText = window.getSelection()?.toString();
          if (selectedText !== '') {
            const inputNote = inputValue;
            setInputValue(inputNote + '\n\n>' + selectedText);
          }
        }
        setInputVisible((visible) => !visible);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // inputタグが表示される度にフォーカスを当てる
  useEffect(() => {
    if (isInputVisible) {
      const inputElement = document.getElementById('shiori-edit');
      inputElement && inputElement.focus();
    }
  }, [isInputVisible]);

  useEffect(() => {
    // この辺、mantineのhookを使って書きたい
    const shoriInput = document.getElementById('shiori-edit');
    if (!shoriInput) return;
    shoriInput.addEventListener('keydown', function (event) {
      if (event.ctrlKey && event.key === 'Enter') {
        const shioriForm = document.getElementById('shiori-edit-form-button') as HTMLButtonElement;
        shioriForm && shioriForm.click();
      }
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const key = getThisPageShioriKey();
    let currentShiori = await getThisPageShiori();
    if (currentShiori === undefined) {
      currentShiori = newShioriNote();
    }
    const newNote = inputValue;
    const newShiori = { ...currentShiori, note: newNote, updatedAt: new Date().toISOString() };
    await saveShioriNote(key, newShiori);
    setInputVisible(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '250px',
        left: '50%',
        width: '40%',
        height: '500px',
        transform: 'translate(-50%, -15%)',
        zIndex: 10000,
        display: isInputVisible ? 'block' : 'none',
      }}
    >
      <form id="shiori-edit-form" style={{ height: '100%' }} onSubmit={handleSubmit}>
        <Form.Control
          id="shiori-edit"
          as="textarea"
          placeholder="Ctrl + Enter で保存します。"
          style={{
            height: '100%',
            width: '100%',
            border: '1px solid #ccc',
            opacity: 0.95,
            padding: '10px',
          }}
          autoFocus={true}
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
          }}
        />
        <button id="shiori-edit-form-button" type="submit" style={{ display: 'none' }} />
      </form>
    </div>
  );
};
