import Layout from '../components/layout';
import Subscribe from '../components/subscribe';
import AllPosts from '../components/AllPosts';
import { getSortedPostsData } from '../lib/posts';
import FeaturedPosts from '../components/FeaturedPosts';

export default function Home({ posts }) {
  return (
    <Layout home description="Software Engineer in Nashville, TN">
      <SiteIntro className="mt-24" />
      <Subscribe className="mt-12" />
      <FeaturedPosts className="mt-12" posts={posts} />
      <AllPosts className="mt-12" posts={posts} />
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

export async function getStaticProps() {
  const posts = getSortedPostsData();
  return {
    props: {
      posts,
    },
  };
}
