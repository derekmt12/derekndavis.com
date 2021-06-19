import 'prism-material-themes/themes/material-palenight.css';

import { useAnalytics } from '../lib/analytics';
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  useAnalytics();

  return <Component {...pageProps} />;
}
