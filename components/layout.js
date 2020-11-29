import Head from 'next/head';
import Link from 'next/link';
import classNames from 'classnames';

import styles from './layout.module.css';

const name = 'Derek Davis';
export const siteTitle = 'Next.js Sample Website';

export default function Layout({ children, home }) {
  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main>
        <header
          className={classNames(
            'bg-gray-300 inset-bottom-shadow',
            home ? 'mb-24' : 'mb-16'
          )}
          style={{ height: home ? '100px' : '50px' }}
        >
          <section style={{ maxWidth: '620px' }} className="mx-auto">
            <div
              className="rounded-full p-2 bg-gray-300 inline-block relative inset-bottom-shadow"
              style={{ top: home ? '40px' : '5px' }}
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
          </section>
        </header>
        {children}
      </main>
      {/* {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      )} */}
    </div>
  );
}
