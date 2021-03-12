import { useEffect } from 'react';
import { useRouter } from 'next/router';
import splitbee from '@splitbee/web';

import 'prism-material-themes/themes/material-palenight.css';
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  // initialize analytics
  useEffect(() => {
    splitbee.init();
  }, []);

  return <Component {...pageProps} />;
}
