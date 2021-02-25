import Link from 'next/link';
import Image from 'next/image';

import Layout from '../components/layout';
import Date from '../components/date';
import Subscribe from '../components/subscribe';
import { getSortedPostsData } from '../lib/posts';

export default function Home({ posts }) {
  return (
    <Layout home description="Software Engineer in Nashville, TN">
      <SiteIntro className="mt-24" />
      <Subscribe className="mt-12" />
      <BlogList className="mt-12" posts={posts} />
    </Layout>
  );
}

function SiteIntro({ className }) {
  return (
    <section className={className}>
      <div className="mx-auto max-width px-4 sm:px-0">
        <h1 className="text-2xl sm:text-4xl font-extrabold">Hi, I'm Derek.</h1>
        <p className="mt-3 sm:text-lg text-gray-600">
          I'm a senior software engineer at UL in Nashville, TN. I love all
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

function BlogList({ posts, className }) {
  return (
    <section className={className}>
      <div className="mx-auto max-width px-4 sm:px-1">
        <h2 className="text-xl uppercase font-bold my-3">Posts</h2>
        <hr className="mb-8" />
        <ul>
          {posts.map((item) => {
            return item.seriesName ? (
              <li key={item.seriesName}>
                <h3 className="text-xl sm:text-2xl">{item.seriesName}</h3>
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
      {posts.map(
        ({
          id,
          date,
          title,
          subtitle,
          image,
          imageAltText,
          imageWidth,
          imageHeight,
        }) => (
          <Post
            key={id}
            {...{
              id,
              date,
              title,
              subtitle,
              image,
              imageAltText,
              imageWidth,
              imageHeight,
            }}
          />
        )
      )}
    </ul>
  );
}

function Post({ id, date, title, subtitle, image, imageAltText }) {
  return (
    <li className="mb-5 rounded shadow-md bg-white transition duration-300 ease-in-out transform hover:shadow-lg hover:scale-105 hover:-translate-y-1">
      <Link href={`/posts/${id}`}>
        <a className="hover:no-underline">
          <div className="sm:flex">
            {image && (
              <div className="post-image-container text-center sm:flex-none sm:w-1/4">
                <Image
                  src={`/images/${image}`}
                  alt={imageAltText}
                  width={400}
                  height={300}
                  className="rounded-tl rounded-tr sm:rounded-bl sm:rounded-tr-none bg-cover bg-center object-cover"
                />
              </div>
            )}

            <div className="py-3 px-4">
              <h4 className="sm:text-lg">{title}</h4>
              <div className="text-sm text-gray-500">
                <Date dateString={date} />
              </div>
              <p className="text-gray-600">{subtitle}</p>
            </div>
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
