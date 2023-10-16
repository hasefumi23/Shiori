import React, { ReactElement, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { addDays, setDefaultOptions } from 'date-fns';
import { ja } from 'date-fns/locale';

import { ShioriNote } from '../shared/models/shioriNote';
import {
  filterThisWeekShiori,
  filterTodaysShiori,
  getAllShiori,
  newShioriNote,
  saveShioriNote,
} from '../shared/utils/shioriUtil';

setDefaultOptions({ locale: ja });

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
      const todayContent = filterTodaysShiori(shioris)
        .map((shiori) => formatShioriNote(shiori))
        .join('\n\n');
      console.log(`todayContent: ${todayContent}`);
      setTodayShiori(todayContent);

      // 今週分のShioriを取得して、設定する
      const thisWeekContent = filterThisWeekShiori(shioris)
        .map((shiori) => formatShioriNote(shiori))
        .join('\n\n');
      console.log(`thisWeekContent ${thisWeekContent}`);

      setThisWeekShiori(thisWeekContent);
    };

    fetchData();
  }, []);

  const buttonStyle = {
    borderRadius: '0px',
    border: '0px',
    padding: '10px',
  };

  return (
    <Stack style={{ width: '380px' }}>
      <Button
        variant="primary"
        style={buttonStyle}
        onClick={async () => await navigator.clipboard.writeText(todayShiori)}
      >
        今日のShioriをコピー
      </Button>
      <Button
        variant="secondary"
        style={buttonStyle}
        onClick={async () => await navigator.clipboard.writeText(thisWeekShiori)}
      >
        今週のShioriをコピー
      </Button>
      <Button
        variant="success"
        style={buttonStyle}
        onClick={async () => await navigator.clipboard.writeText(allShiori)}
      >
        全てのShioriをコピー
      </Button>
    </Stack>
  );
};

export default Popup;
