import PostList from './PostList';

export default function FeaturedPosts({ posts, className }) {
  const postsWithoutSeries = posts.filter((post) => !post.seriesName);
  const seriesPosts = posts
    .filter((post) => post.seriesName)
    .map((post) => post.posts)
    .flat();

  const featuredPosts = [...postsWithoutSeries, ...seriesPosts]
    .filter((post) => post.featured)
    .sort((postA, postB) => postA.featured - postB.featured);

  return (
    <section className={className}>
      <div className="mx-auto max-width px-4 sm:px-1">
        <h2 className="text-xl uppercase font-bold my-3">Featured</h2>
        <hr className="mb-8" />
        <PostList posts={featuredPosts} />
      </div>
    </section>
  );
}
