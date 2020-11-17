import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { getAllPostIds, getPostData } from '../../lib/posts';

export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <header style={{ maxWidth: '620px' }} className="mx-auto">
        <Link href="/">
          <a className="hover:no-underline">
            <div className="py-3 inline-flex">
              <img
                src="/images/profile.png"
                className="rounded-full"
                style={{ width: '50px', height: '50px' }}
                alt="Derek Davis"
              />
              <span className="self-center ml-3 text-black">
                Derek N. Davis
              </span>
            </div>
          </a>
        </Link>
      </header>
      <article
        style={{ maxWidth: '620px' }}
        className="mx-auto prose-sm p-5 sm:p-0 sm:prose"
      >
        {/* {postData.imageUrl && (
        <img
          style={{ width: '100%' }}
          src={postData.imageUrl}
          className={utilStyles.image}
        />
      )} */}
        <header>
          <h1 className="text-3xl font-bold">
            {postData.series && (
              <>
                <span className="text-xl sm:text-2xl font-bold text-gray-500">
                  {postData.series}
                </span>
                <br />
              </>
            )}
            <span>{postData.title}</span>
          </h1>
          <div className="text-gray-600 mb-2">
            <Date dateString={postData.date} />
          </div>
          <div className="mb-5">
            {postData.tags &&
              postData.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-2 border-blue-500 rounded mr-2 p-1 px-2 text-blue-500 text-sm"
                >
                  {tag}
                </span>
              ))}
          </div>
        </header>
        <section dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
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
  return {
    props: {
      postData,
    },
  };
}
