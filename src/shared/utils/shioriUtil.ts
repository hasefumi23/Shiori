import { getBucket } from '@extend-chrome/storage';
import { isThisWeek, isToday } from 'date-fns';

import { ShioriBucket, ShioriNote } from '../models/shioriNote';

export const shioriBucket = getBucket<ShioriBucket>('shiori', 'sync');

export const getThisPageShioriKey = () => {
  const hostname = document.location.hostname;
  const pathname = document.location.pathname;
  const key = `${hostname}${pathname}`;
  return key;
};

export const buildShioriKeyByUrl = (url: string) => {
  const hostname = new URL(url).hostname;
  const pathname = new URL(url).pathname;
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

export const getOrCreateShioriNote = async (key: string) => {
  const shiori = await getShioriByKey(key);
  if (shiori === undefined) {
    const newShiori = newShioriNote();
    await saveShioriNote(key, newShiori);
    return newShiori;
  }
  return shiori;
};

export const saveShioriNote = async (key = getThisPageShioriKey(), shiori: ShioriNote) => {
  await shioriBucket.set({ [key]: shiori });
};

export const getAllShiori = async (): Promise<ShioriNote[]> => {
  const keys = await shioriBucket.getKeys();
  const noteArray = [];
  for (const key of keys) {
    const val = await shioriBucket.get((values: ShioriBucket) => values[key]);
    noteArray.push(val);
  }
  return noteArray;
};

export const filterTodaysShiori = (shioris: ShioriNote[]) => {
  const filtered = shioris.filter((shiori: ShioriNote) => isToday(new Date(shiori.updatedAt)));
  return filtered;
};

export const filterThisWeekShiori = (shioris: ShioriNote[]) => {
  const filtered = shioris.filter((shiori) => isThisWeek(new Date(shiori.updatedAt)));
  return filtered;
};
