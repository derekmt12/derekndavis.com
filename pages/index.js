import Link from 'next/link';

import Layout from '../components/layout';
import Date from '../components/date';
import { getSortedPostsData } from '../lib/posts';

export default function Home({ posts }) {
  return (
    <Layout home>
      <SiteIntro />
      <BlogList posts={posts} />
    </Layout>
  );
}

function SiteIntro() {
  return (
    <section>
      <div className="mx-auto max-width px-4 sm:px-0 pt-24 pb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold">Hi, I'm Derek.</h1>
        <p className="mt-3 sm:text-lg text-gray-600">
          I'm a senior software engineer at UL in Franklin, TN. I love all
          things JavaScript and have been developing for the web since 2012. I'm
          a lifelong learner and enjoy teaching programming topics in general.
        </p>
        <p className="mt-3 sm:text-lg text-gray-600">
          I'm a Christ follower, husband, and father. When I'm not working in VS
          Code, I'm likely making espresso or planning trips abroad.
        </p>
      </div>
    </section>
  );
}

function BlogList({ posts }) {
  return (
    <section>
      <div className="mx-auto max-width px-4 sm:px-0">
        <h2 className="text-xl uppercase font-bold my-3">Posts</h2>
        <hr className="mb-8" />
        <ul>
          {posts.map((item) => {
            return item.series ? (
              <li key={item.series}>
                <h3 className="text-xl sm:text-2xl">{item.series}</h3>
                <p className="text-gray-500 mb-5 sm:text-lg">
                  {item.seriesSubtitle}
                </p>
                <Posts posts={item.posts} />
                <hr className="my-8" />
              </li>
            ) : (
              <Post key={item.id} {...item} />
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Posts({ posts }) {
  return (
    <ul>
      {posts.map(({ id, date, title, excerpt }, index) => (
        <Post key={id} {...{ id, date, title, excerpt }} />
      ))}
    </ul>
  );
}

function Post({ id, date, title, excerpt }) {
  return (
    <li className="mb-5 rounded shadow-md bg-white transition duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1">
      <Link href={`/posts/${id}`}>
        <a className="hover:no-underline">
          <div className="p-3">
            <h4 className="sm:text-lg">{title}</h4>
            <div className="text-sm text-gray-500">
              <Date dateString={date} />
            </div>
            {/* <p className="text-gray-600">{excerpt}</p> */}
          </div>
        </a>
      </Link>
    </li>
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
