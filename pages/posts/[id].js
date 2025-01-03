import Link from 'next/link';
import Image from 'next/legacy/image';
import classNames from 'classnames';
import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatUrl } from 'url-lib';
import {
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { getAllPostIds, getPostData, getSeries } from '../../lib/posts';
import { track } from '../../lib/analytics';

export default function Post({ postData, series }) {
  const shareUrl = formatUrl(`https://derekndavis.com${postData.urlPath}`, {
    utm_medium: 'social',
    utm_campaign: 'share',
  });

  return (
    <Layout
      title={postData.title}
      description={postData.subtitle}
      postDate={postData.date}
      urlPath={postData.urlPath}
      image={postData.image}
      type="article"
    >
      <article className="max-width mx-auto p-5 sm:p-0 text-gray-700">
        <header className="">
          <h1 className="text-3xl sm:text-4xl font-bold">
            {postData.seriesName && (
              <div className="text-xl sm:text-2xl font-bold text-gray-500">
                {postData.seriesName}
              </div>
            )}
            <div className="-mt-1 leading-10 text-black">{postData.title}</div>
          </h1>
          <p className="text-gray-700 text-2xl">{postData.subtitle}</p>
          <div className="text-gray-600 mb-2">
            <Date dateString={postData.date} />
          </div>
          {/* <div className="mb-5">
            {postData.tags &&
              postData.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-2 border-blue-500 rounded mr-2 p-1 px-2 text-blue-500 text-sm"
                >
                  {tag}
                </span>
              ))}
          </div> */}
          {postData.image && (
            <>
              <Image
                src={`/images/${postData.image}`}
                alt={postData.imageAltText}
                width={612}
                height={612 / (postData.imageWidth / postData.imageHeight)}
                className="rounded-lg"
                priority
              />
              {postData.photographer && (
                <div className="text-gray-600 text-sm">
                  Photo by{' '}
                  <a
                    className="text-gray-800 underline"
                    href={postData.photographerLink}
                    target="_blank"
                  >
                    {postData.photographer}
                  </a>
                </div>
              )}
            </>
          )}
          {series && <SeriesList className="mt-8" {...{ postData, series }} />}
        </header>
        <section
          className="prose sm:prose-lg mt-8"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
        <div className="flex mt-8">
          <TwitterShareButton
            url={formatUrl(shareUrl, { utm_source: 'twitter' })}
            title={`${postData.title} - ${postData.subtitle}`}
            via="DerekMT12"
            hashtags={postData.tags || []}
            aria-label="Share on Twitter"
            onShareWindowClose={track.share.twitter}
            className="mr-2"
          >
            <TwitterIcon round size={48} />
          </TwitterShareButton>
          <FacebookShareButton
            url={formatUrl(shareUrl, { utm_source: 'facebook' })}
            title={`${postData.title} - ${postData.subtitle}`}
            aria-label="Share on Facebook"
            onShareWindowClose={track.share.facebook}
            className="mr-2"
          >
            <FacebookIcon round size={48} />
          </FacebookShareButton>
          <LinkedinShareButton
            url={formatUrl(shareUrl, { utm_source: 'linkedin' })}
            title={postData.title}
            summary={postData.subtitle}
            source="https://derekndavis.com"
            aria-label="Share on LinkedIn"
            onShareWindowClose={track.share.linkedIn}
          >
            <LinkedinIcon round size={48} />
          </LinkedinShareButton>
        </div>
        <div className="my-8">
          <a
            href={`https://twitter.com/search?q=https://derekndavis.com${postData.urlPath}`}
            target="_blank"
            onClick={track.discussOnTwitter}
          >
            <FontAwesomeIcon
              icon={faTwitter}
              className="inline-block text-blue-400 mr-3 w-6 h-6"
            />
            Discuss on Twitter
          </a>{' '}
          <span className="inline-block mx-2 text-gray-500">|</span>
          <a
            href={`https://github.com/derekmt12/derekndavis.com/blob/master${postData.urlPath}.md`}
            target="_blank"
          >
            <FontAwesomeIcon
              icon={faGithub}
              className="inline-block text-gray-600 mr-3 w-6 h-6"
            />
            Edit on Github
          </a>
        </div>
        {series && <SeriesNextUp className="mt-8" {...{ postData, series }} />}
      </article>
    </Layout>
  );
}

function SeriesList({ className, postData, series }) {
  return (
    <ul className={classNames('text-sm', className)}>
      {series.posts.map((p) => (
        <li key={p.urlPath} className="mb-2">
          {p.urlPath === postData.urlPath ? (
            <>
              <FontAwesomeIcon
                icon={faCircleRegular}
                className="inline-block mr-3 text-green-400"
                style={{ width: '16px', height: '16px' }}
              />
              <div className="inline-block text-lg">{p.title}</div>
            </>
          ) : (
            <>
              <FontAwesomeIcon
                icon={faCircleRegular}
                className="inline-block mr-3 text-gray-400"
                style={{ width: '16px', height: '16px' }}
              />
              <Link href={p.urlPath} className="text-gray-900 underline">
                {p.title}
              </Link>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function SeriesNextUp({ className, postData, series }) {
  const nextArticle = series.posts.find((p) => p.sequence > postData.sequence);

  return nextArticle ? (
    <Link href={nextArticle.urlPath} className="hover:no-underline">
      <div
        className={classNames(
          'bg-white p-3 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1',
          className
        )}
      >
        <h3 className="text-lg text-black">Next Up</h3>
        <div>{nextArticle.title}</div>
        <div className="text-gray-600">{nextArticle.subtitle}</div>
      </div>
    </Link>
  ) : null;
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  const series = postData.seriesName ? getSeries(postData.seriesName) : null;
  return {
    props: {
      postData,
      series,
    },
  };
}
