import { getBucket } from '@extend-chrome/storage';

import { ShioriBucket } from '../models/shioriNote';

const bucket = getBucket<ShioriBucket>('shiori', 'sync');

export const getThisPageShioriKey = () => {
  const hostname = document.location.hostname;
  const pathname = document.location.pathname;
  const key = `${hostname}${pathname}`;
  return key;
};

export const getThisPageShiori = async () => {
  const shiori = await bucket.get((values: ShioriBucket) => values[getThisPageShioriKey()]);
  return shiori;
};

export const getShioriByKey = async (key: string) => {
  const shiori = await bucket.get((values: ShioriBucket) => values[key]);
  return shiori;
};

export const newShiori = () => {
  const shiori = {
    note: '',
    title: document.title,
    href: document.location.href,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return shiori;
};
