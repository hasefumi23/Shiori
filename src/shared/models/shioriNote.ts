export interface ShioriNote {
  note: string;
  title: string;
  href: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShioriBucket {
  [key: string]: ShioriNote;
}
