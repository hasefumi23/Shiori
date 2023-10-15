import React, { useState } from 'react';
import { MdDone, MdOutlineContentCopy, MdVolumeUp } from 'react-icons/md';
import {
  ActionIcon,
  Avatar,
  CopyButton,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';

import { translate } from '../app/translate';

// const bucket = getBucket<ShioriBucket>('my_bucket', 'sync');

export const Content = ({
  translatedText,
  originalText,
  targetLang,
}: {
  translatedText: string;
  originalText: string;
  targetLang: string;
}) => {
  // const [opened, setOpened] = useState(true);
  // const [dialog, setDialog] = useState<HTMLDivElement | null>(null);
  const [text, setText] = useState(translatedText);
  const [lang, setLang] = useState(targetLang);
  // useClickOutside(() => setOpened(false), null, [dialog]);
  const IconUrl = chrome.runtime.getURL('images/extension_128.png');

  const handleChange = async (value: string) => {
    // bucket.get({ targetLang: value });
    const newText = await translate(originalText, value);
    setText(newText);
    setLang(value);
  };
  const test = '';

  return test === '' ? (
    <>
      <Flex pb="xs" gap="xs" justify="flex-start" align="center">
        <Avatar src={IconUrl} />
        <Text size="md">訳文</Text>
        <Select
          value={lang}
          onChange={(value: string) => handleChange(value)}
          size="xs"
          data={[
            { value: 'EN', label: '英語' },
            { value: 'JA', label: '日本語' },
            { value: 'ZH', label: '中国語' },
            { value: 'KO', label: '韓国語' },
          ]}
        />
      </Flex>
      <Divider />
      <Stack pt="sm" style={{ textAlign: 'left' }}>
        <Text size="sm">{text}</Text>
        <Group>
          <Tooltip label="音声読み上げ" withArrow>
            <ActionIcon>
              <MdVolumeUp />
            </ActionIcon>
          </Tooltip>
          <CopyButton value={text}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? '訳文をコピーしました' : 'クリップボードにコピー'} withArrow>
                <ActionIcon onClick={copy}>
                  {copied ? <MdDone /> : <MdOutlineContentCopy />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Stack>
    </>
  ) : (
    <></>
  );
};
