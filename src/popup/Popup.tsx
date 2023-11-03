import React, { ReactElement, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { setDefaultOptions } from 'date-fns';
import { ja } from 'date-fns/locale';

import { ShioriNote } from '../shared/models/shioriNote';
import {
  buildShioriKeyByUrl,
  filterThisWeekShiori,
  filterTodaysShiori,
  getAllShiori,
  getShioriByKey,
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

async function getCurrentPageUrl() {
  // エディター上ではエラーになるが、実際には動く
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return tabs[0].url;
}
const Popup = (): ReactElement => {
  const formatShioriNote = (note: ShioriNote): string => {
    if (note == null) {
      console.warn('note is null');
      return '';
    }

    return `## [${note.title}](${note.href})\n\n${note.note}`;
  };

  // 状態を管理するためのuseStateを追加
  const [thisPageShiori, setThisPageShiori] = useState('');
  const [todayShiori, setTodayShiori] = useState('');
  const [thisWeekShiori, setThisWeekShiori] = useState('');
  const [allShiori, setAllShiori] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // await saveTestData();

      // 現在アクティブなページShioriを取得して、設定する
      // ポップアップからは、現在アクティブなページのurlの取得がとても面倒だが、こう書くしかない
      const curPageUrl = await getCurrentPageUrl();
      const curPageShioriKey = buildShioriKeyByUrl(curPageUrl);
      const curPageShiori = await getShioriByKey(curPageShioriKey);
      setThisPageShiori(formatShioriNote(curPageShiori));

      // 現在保持している全てのShioriを取得して、設定する
      const shioris = await getAllShiori();
      setAllShiori(shioris.map((shiori) => formatShioriNote(shiori)).join('\n\n'));

      // 今日分のShioriを取得して、設定する
      const todayContent = filterTodaysShiori(shioris)
        .map((shiori) => formatShioriNote(shiori))
        .join('\n\n');
      setTodayShiori(todayContent);

      // 今週分のShioriを取得して、設定する
      const thisWeekContent = filterThisWeekShiori(shioris)
        .map((shiori) => formatShioriNote(shiori))
        .join('\n\n');

      setThisWeekShiori(thisWeekContent);
    };

    fetchData();
  }, []);

  return (
    <Stack style={{ width: '380px' }}>
      <CopyButton
        variant="light"
        copyText={thisPageShiori}
        buttonText="このページのShioriをコピー"
      />
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
  const [clicked, setClicked] = useState(false);

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
