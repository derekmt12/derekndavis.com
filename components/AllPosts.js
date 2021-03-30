import PostList from './PostList';
import Post from './Post';

export default function AllPosts({ posts, className }) {
  return (
    <section className={className}>
      <div className="mx-auto max-width px-4 sm:px-1">
        <h2 className="text-xl uppercase font-bold my-3">All Posts</h2>
        <hr className="mb-8" />
        <ul>
          {posts.map((item) => {
            return item.seriesName ? (
              <li key={item.seriesName}>
                <h3 className="text-xl sm:text-2xl">{item.seriesName}</h3>
                <p className="text-gray-500 mb-5 sm:text-lg">
                  {item.seriesSubtitle}
                </p>
                <PostList posts={item.posts} />
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
