import Head from 'next/head';
import Link from 'next/link';
import classNames from 'classnames';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Layout({ children, home, title }) {
  const defaultTitle = 'Derek N. Davis';
  const siteTitle = title ? `${title} - ${defaultTitle}` : defaultTitle;
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

      <header
        className={classNames(
          'bg-gray-800 inset-bottom-shadow',
          !home ? 'mb-16' : null
        )}
        style={{
          height: home ? '100px' : '50px',
          background:
            "url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1650&q=80')",
        }}
      >
        <div
          style={{
            backgroundColor: 'rgb(237 241 253 / 70%)',
            height: home ? '100px' : '50px',
          }}
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
              <a href="https://www.twitter.com/derekmt12">
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="inline-block text-gray-100 mr-3"
                  style={{ width: '32px', height: '32px' }}
                />
              </a>
              <a href="https://www.linkedin.com/in/derekmt12">
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="inline-block text-gray-100"
                  style={{ width: '32px', height: '32px' }}
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
        </div>
      )}
    </div>
  );
}
