import React, { ReactElement, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { setDefaultOptions } from 'date-fns';
import { ja } from 'date-fns/locale';

import { ShioriNote } from '../shared/models/shioriNote';
import {
  filterThisWeekShiori,
  filterTodaysShiori,
  getAllShiori,
  getThisPageShiori,
} from '../shared/utils/shioriUtil';

import './popup.css';

setDefaultOptions({ locale: ja });

/**
 * 
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
 */

const Popup = (): ReactElement => {
  const formatShioriNote = (note: ShioriNote): string => {
    return `## [${note.title}](${note.href})\n\n${note.note}`;
  };

  // 状態を管理するためのuseStateを追加
  // const [thisPageShiori, setThisPageShiori] = React.useState('');
  const [todayShiori, setTodayShiori] = React.useState('');
  const [thisWeekShiori, setThisWeekShiori] = React.useState('');
  const [allShiori, setAllShiori] = React.useState('');

  useEffect(() => {
    const fetchData = async () => {
      // await saveTestData();
      setThisPageShiori((await getThisPageShiori())?.note || '');

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

  return (
    <Stack style={{ width: '380px' }}>
      {/*
      FIXME: popupから開いている画面のurlを取得する方法がわからないので、コメントアウトしておく
      <CopyButton
        variant="light"
        copyText={thisPageShiori}
        buttonText="このページのShioriをコピー"
      />
       */}
      <CopyButton variant="primary" copyText={todayShiori} buttonText="今日のShioriをコピー" />
      <CopyButton variant="secondary" copyText={thisWeekShiori} buttonText="今週のShioriをコピー" />
      <CopyButton variant="success" copyText={allShiori} buttonText="全てのShioriをコピー" />
    </Stack>
  );
};

const CopyButton = ({
  variant,
  copyText,
  buttonText,
}: {
  variant: string;
  copyText: string;
  buttonText: string;
}): ReactElement => {
  const [clicked, setClicked] = React.useState(false);

  useEffect(() => {
    // clickedがtrueの場合のみ、タイマーをセットする
    if (clicked) {
      // クリック後3秒後にメッセージをリセットする
      const timer = setTimeout(() => {
        setClicked(false);
      }, 300);

      // コンポーネントのクリーンアップ時にタイマーをクリアする
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  const buttonStyle = {
    borderRadius: '0px',
    border: '0px',
    padding: '10px',
  };

  return (
    <Button
      variant={variant}
      style={buttonStyle}
      className={clicked ? 'copy-button-clicked-animation' : ''}
      onClick={async () => {
        await navigator.clipboard.writeText(copyText);
        setClicked(true);
      }}
    >
      {buttonText}
    </Button>
  );
};

export default Popup;
