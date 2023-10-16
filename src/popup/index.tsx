import React from 'react';
import { createRoot } from 'react-dom/client';

import Popup from './Popup';

// popupの場合、このimportがないとstyleが適用されない
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root') as HTMLElement).render(<Popup />);
