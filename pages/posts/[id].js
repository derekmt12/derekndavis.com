import Link from 'next/link';
import Image from 'next/image';
import classNames from 'classnames';
import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { getAllPostIds, getPostData, getSeries } from '../../lib/posts';

export default function Post({ postData, series }) {
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
          <h1 className="text-4xl font-bold">
            {postData.seriesName && (
              <div className="text-xl sm:text-2xl font-bold text-gray-500">
                {postData.seriesName}
              </div>
            )}
            <div className="-mt-1 leading-10 text-black">{postData.title}</div>
          </h1>
          <p className="text-gray-700 text-lg">{postData.subtitle}</p>
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
                  </a>{' '}
                  on{' '}
                  <a
                    className="text-gray-800 underline"
                    href={postData.unsplashLink}
                    target="_blank"
                  >
                    Unsplash
                  </a>
                </div>
              )}
            </>
          )}
          {series && <SeriesList className="mt-8" {...{ postData, series }} />}
        </header>
        <section
          className="prose-sm sm:prose-lg mt-8"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
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
              <Link href={p.urlPath}>
                <a className="text-gray-900 underline">{p.title}</a>
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
    <Link href={nextArticle.urlPath}>
      <a className="hover:no-underline">
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
      </a>
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
