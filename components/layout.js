import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import classNames from 'classnames';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Subscribe from './subscribe';

import { track } from '../lib/analytics';

const SITE_URL = 'https://derekndavis.com';

export default function Layout({
  children,
  home,
  title,
  description,
  image = null,
  postDate = null,
  type: layoutType = 'website',
  urlPath = null,
}) {
  const defaultTitle = 'Derek N. Davis';
  const siteTitle = title ? `${title} - ${defaultTitle}` : defaultTitle;
  const imageUrl = `${SITE_URL}/images/${image}`;

  return (
    <div>
      <Head>
        <title>{siteTitle}</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="description" content={description} />
        {postDate && (
          <meta property="article:published_time" content={postDate} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@derekmt12" />
        <meta name="twitter:title" content={title || defaultTitle} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={imageUrl} />}

        <meta property="og:title" content={title || defaultTitle} />
        <meta property="og:url" content={`${SITE_URL}${urlPath || ''}`} />
        <meta property="og:type" content={layoutType} />
        <meta property="og:site_name" content={title || defaultTitle} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={imageUrl} />}
      </Head>

      <header
        className={classNames(
          'bg-gray-800 inset-bottom-shadow',
          !home ? 'mb-16' : null
        )}
        style={{ height: home ? '100px' : '50px' }}
      >
        <div
          style={{ height: home ? '100px' : '50px' }}
          className="absolute w-full overflow-hidden"
        >
          <Image
            src="/images/florian-olivo-4hbJ-eymZ1o-unsplash.jpg"
            alt="Photo by Florian Olivo on Unsplash"
            layout="responsive"
            width={1650}
            height={1650 / (2400 / 1600)}
            priority
          />
        </div>
        <div
          style={{
            backgroundColor: 'rgb(237 241 253 / 70%)',
            height: home ? '100px' : '50px',
          }}
          className="absolute w-full"
        >
          <section className="mx-auto max-width px-4 sm:px-0 relative">
            <div
              className="rounded-full p-2 inline-block relative inset-bottom-shadow"
              style={{
                top: home ? '40px' : '5px',
                backgroundColor: 'rgb(178 180 189)',
              }}
            >
              <Link href="/">
                <a>
                  <img
                    src="/images/profile.png"
                    className="rounded-full"
                    style={{
                      width: home ? '100px' : '70px',
                      height: home ? '100px' : '70px',
                    }}
                    alt="Derek Davis"
                  />
                </a>
              </Link>
            </div>
            <div
              className="absolute right-0 pr-2 sm:p-0"
              style={{ bottom: home ? '30px' : '52px' }}
            >
              <a
                href="https://www.twitter.com/derekmt12"
                target="_blank"
                onClick={track.twitterProfile}
              >
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="inline-block text-gray-100 mr-3 w-8 h-8"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/derekmt12"
                target="_blank"
                onClick={track.linkedInProfile}
              >
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="inline-block text-gray-100 w-8 h-8"
                />
              </a>
            </div>
          </section>
        </div>
      </header>
      <main>{children}</main>
      {!home && (
        <div className="max-width mx-auto my-12 px-4 sm:px-0">
          <Link href="/">
            <a>← Back to home</a>
          </Link>
          <Subscribe className="my-12" />
        </div>
      )}
    </div>
  );
}
