import React, { ReactElement, useEffect, useState } from 'react';
import { getBucket } from '@extend-chrome/storage';
import { Container, Select } from '@mantine/core';

interface MyBucket {
  targetLang: string;
}

const bucket = getBucket<MyBucket>('my_bucket', 'sync');

const Popup = (): ReactElement => {
  document.body.style.width = '15rem';
  document.body.style.height = '15rem';

  const [lang, setLang] = useState('EN');

  useEffect(() => {
    (async () => {
      const value = await bucket.get();
      if (value.targetLang) {
        setLang(value.targetLang);
      }
    })();
  }, []);

  const saveLang = (lang: string) => {
    bucket.set({ targetLang: lang });
    setLang(lang);
  };

  return (
    <Container p="xl">
      <Select
        label="どの言語に翻訳しますか?"
        value={lang}
        onChange={(value: string) => saveLang(value)}
        data={[
          { value: 'EN', label: '英語' },
          { value: 'JA', label: '日本語' },
          { value: 'ZH', label: '中国語' },
          { value: 'KO', label: '韓国語' },
        ]}
      />
    </Container>
  );
};

export default Popup;
