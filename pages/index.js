import Head from 'next/head';
import Link from 'next/link';

import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import { getSortedPostsData } from '../lib/posts';

export default function Home({ posts }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <SiteIntro />

      <BlogList posts={posts} />
    </Layout>
  );
}

function SiteIntro() {
  return (
    <section style={{ maxWidth: '620px' }} className="mx-auto mt-3">
      <h1 className="text-3xl">Hi, I'm Derek.</h1>
      <p className="mt-3 prose text-lg text-gray-600">
        I'm a senior software engineer at UL in Franklin, TN. I love all things
        JavaScript and have been developing for the web since I graduated Middle
        Tennessee State University in 2012. I'm a life-long learner and enjoy
        teaching programming topics in general.
      </p>
      <p className="mt-3 prose text-lg text-gray-600">
        I'm a Christ follower, husband, and father. When I'm not working in VS
        Code, I'm likely making espresso or planning trips abroad.
      </p>
    </section>
  );
}

function BlogList({ posts }) {
  return (
    <section style={{ maxWidth: '620px' }} className="mx-auto">
      <h2 className="text-2xl my-3">Posts</h2>
      <ul>
        <li className="mb-5 rounded shadow-md p-3 bg-white">
          <h2 className="text-2xl">React Migration Series</h2>
          <p className="text-gray-500 mb-5 text-lg">
            Convert your AngularJS app to React
          </p>
          <ul>
            {posts.map(({ id, date, title, excerpt }, index) => (
              <li className="flex" key={id}>
                <div style={{ width: '100px' }} className="flex-none">
                  <img
                    src="https://via.placeholder.com/80"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <Link href={`/posts/${id}`}>
                    <a className="text-lg">{title}</a>
                  </Link>
                  <br />
                  <div className="text-sm text-gray-500">
                    <Date dateString={date} />
                  </div>
                  <p className="text-gray-600">{excerpt}</p>
                  {posts.length > index + 1 ? (
                    <hr className="my-5 border-gray-200" />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </section>
  );
}

export async function getStaticProps() {
  const posts = getSortedPostsData();
  return {
    props: {
      posts,
    },
  };
}
