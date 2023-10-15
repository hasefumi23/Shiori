import React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';

import { EditNote } from './editNote';
import { SimpleInput } from './simpleInput';

const App = () => {
  return (
    <MantineProvider>
      <EditNote />
    </MantineProvider>
  );
};

const container = document.createElement('shiori-root');
document.body.after(container);
const root = createRoot(container);
root.render(<App />);
