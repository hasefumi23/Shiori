import { getBucket } from '@extend-chrome/storage';

import { ShioriBucket, ShioriNote } from '../models/shioriNote';

export const shioriBucket = getBucket<ShioriBucket>('shiori', 'sync');

export const getThisPageShioriKey = () => {
  const hostname = document.location.hostname;
  const pathname = document.location.pathname;
  const key = `${hostname}${pathname}`;
  return key;
};

export const getThisPageShiori = async () => {
  const shiori = await shioriBucket.get((values: ShioriBucket) => values[getThisPageShioriKey()]);
  return shiori;
};

export const getShioriByKey = async (key: string) => {
  const shiori = await shioriBucket.get((values: ShioriBucket) => values[key]);
  return shiori;
};

export const newShioriNote = () => {
  const current = new Date().toISOString();
  const shiori = {
    note: '',
    title: document.title,
    href: document.location.href,
    createdAt: current,
    updatedAt: current,
  };
  return shiori;
};

export const saveShioriNote = async (key = getThisPageShioriKey(), shiori: ShioriNote) => {
  await shioriBucket.set({ [key]: shiori });
};
