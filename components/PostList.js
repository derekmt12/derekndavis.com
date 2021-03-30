import Post from './Post';

export default function PostList({ posts }) {
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
