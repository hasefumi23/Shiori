import React, { ReactElement, useEffect } from 'react';
import { Button, Container, CopyButton, Stack } from '@mantine/core';
import { addDays, isSameDay, isThisWeek, setDefaultOptions } from 'date-fns';
import { ja } from 'date-fns/locale';

import { ShioriBucket, ShioriNote } from '../shared/models/shioriNote';
import { newShioriNote, saveShioriNote, shioriBucket } from '../shared/utils/shioriUtil';

setDefaultOptions({ locale: ja });

const getAllShiori = async (): Promise<ShioriNote[]> => {
  const keys = await shioriBucket.getKeys();
  const noteArray = [];
  for (const key of keys) {
    const val = await shioriBucket.get((values: ShioriBucket) => values[key]);
    noteArray.push(val);
  }
  return noteArray;
};

const saveTestData = async () => {
  const shiori = newShioriNote();

  // 今日のShioriを作成する
  const todayShiori = {
    ...shiori,
    updatedAt: new Date().toISOString(),
    title: '今日のShiori',
  };
  await saveShioriNote('今日のShiori', todayShiori);

  const tomorrowDate = addDays(new Date(), 1);
  const tomorrowShiori = {
    ...shiori,
    updatedAt: tomorrowDate.toISOString(),
    title: '1日後のShiori',
  };
  await saveShioriNote('1日後のShiori', tomorrowShiori);

  // 一週間後のShioriを作成する
  const nextWeekDate = addDays(new Date(), 7);
  const nextWeekShiori = {
    ...shiori,
    updatedAt: nextWeekDate.toISOString(),
    title: '1週間後のShiori',
  };
  await saveShioriNote('1週間後のShiori', nextWeekShiori);
};

const Popup = (): ReactElement => {
  document.body.style.width = '15rem';
  document.body.style.height = '10rem';

  const formatShioriNote = (note: ShioriNote): string => {
    return `## [${note.title}](${note.href})\n\n${note.note}`;
  };

  // 状態を管理するためのuseStateを追加
  const [todayShiori, setTodayShiori] = React.useState('');
  const [thisWeekShiori, setThisWeekShiori] = React.useState('');
  const [allShiori, setAllShiori] = React.useState('');

  useEffect(() => {
    const fetchData = async () => {
      // FIXME: 一時的にテストデータを作成するコードなので、後で削除する
      await saveTestData();

      // 現在保持している全てのShioriを取得して、設定する
      const shioris = await getAllShiori();
      setAllShiori(shioris.map((shiori) => formatShioriNote(shiori)).join('\n\n'));

      // 今日分のShioriを取得して、設定する
      const todayContent = shioris
        .filter((shiori) => isSameDay(new Date(shiori.updatedAt), new Date()))
        .map((shiori) => formatShioriNote(shiori))
        .join('\n\n');
      console.log(`todayContent: ${todayContent}`);
      setTodayShiori(todayContent);

      // 今週分のShioriを取得して、設定する
      const thisWeekContent = shioris
        .filter((shiori) => isThisWeek(new Date(shiori.updatedAt)))
        .map((shiori) => formatShioriNote(shiori))
        .join('\n\n');
      console.log(`thisWeekContent ${thisWeekContent}`);

      setThisWeekShiori(thisWeekContent);
    };

    fetchData();
  }, []);

  // TODO: 全然styleがあたっていないので、いずれ直す
  return (
    <Container>
      <Stack>
        <CopyButton value={todayShiori}>
          {({ copied, copy }) => (
            <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
              {copied ? '今日のShioriをコピー!' : '今日のShioriをコピー'}
            </Button>
          )}
        </CopyButton>
        <CopyButton value={thisWeekShiori}>
          {({ copied, copy }) => (
            <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
              {copied ? '今週のShioriをコピー!' : '今週のShioriをコピー'}
            </Button>
          )}
        </CopyButton>
        <CopyButton value={allShiori}>
          {({ copied, copy }) => (
            <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
              {copied ? '全てのShioriをコピー!' : '全てのShioriをコピー'}
            </Button>
          )}
        </CopyButton>
      </Stack>
    </Container>
  );
};

export default Popup;
