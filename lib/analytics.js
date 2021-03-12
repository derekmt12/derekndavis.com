import { useEffect } from 'react';
import splitbee from '@splitbee/web';

const track = {
  twitterProfile: () => splitbee.track('Twitter Profile'),
  linkedInProfile: () => splitbee.track('LinkedIn Profile'),
  discussOnTwitter: () => splitbee.track('Discuss on Twitter'),
};

function useAnalytics() {
  useEffect(() => {
    splitbee.init();
  }, []);
}

export { useAnalytics, track };
