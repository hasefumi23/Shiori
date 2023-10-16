import React from 'react';
import { createRoot } from 'react-dom/client';

import { EditNote } from './editNote';

const App = () => {
  return <EditNote />;
};

const container = document.createElement('shiori-root');
document.body.after(container);
const root = createRoot(container);
root.render(<App />);
