import React, { ReactElement } from 'react';
import { getBucket } from '@extend-chrome/storage';
import { Button, Container, CopyButton, Popover, Text } from '@mantine/core';

import { ShioriBucket, ShioriNote } from '../shared/models/shioriNote';

/**
 * 1. 出力ボタンを表示する
 * 2. 出力ボタンを押すと以下の処理を実行する
 *     1. 現在保存しているShioriNoteを取得する
 *     2. クリップボードにコピーする
 */

const bucket = getBucket<ShioriBucket>('shiori', 'local');

const Popup = (): ReactElement => {
  // document.body.style.width = '15rem';
  // document.body.style.height = '15rem';

  const buildFormattedShioriNote = (note: ShioriNote): string => {
    return `## [${note.title}](${note.href})\n\n${note.note}`;
  };

  // 状態を管理するためのuseStateを追加
  const [str, setStr] = React.useState('');
  // コンポーネントがマウントされたときに非同期処理を行う
  React.useEffect(() => {
    const fetchData = async () => {
      const keys = await bucket.getKeys();
      const noteArray = [];
      for (const key of keys) {
        const val = await bucket.get((values: ShioriBucket) => values[key]);
        noteArray.push(buildFormattedShioriNote(val));
      }
      setStr(noteArray.join('\n\n'));
    };

    fetchData();
  }, []);

  return (
    <Container p="xl">
      <input type="date" />
      <input type="date" />
      <CopyButton value={str}>
        {({ copied, copy }) => (
          <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
            {copied ? 'Copied url' : 'Copy url'}
          </Button>
        )}
      </CopyButton>
    </Container>
  );
};

export default Popup;
