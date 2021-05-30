import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remark from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import sortBy from 'lodash.sortby';
import groupBy from 'lodash.groupby';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });

  const singlePosts = allPostsData.filter((p) => !p.seriesName);
  const seriesPosts = allPostsData.filter((p) => p.seriesName);

  let seriesGroups = Object.entries(groupBy(seriesPosts, 'seriesName')).map(
    ([seriesName, posts]) => {
      return {
        seriesName,
        seriesSubtitle: posts[0].seriesSubtitle,
        date: sortBy(posts.map((post) => post.date)).reverse()[0],
        posts: sortBy(posts, 'sequence'),
      };
    }
  );

  return sortBy([...seriesGroups, ...singlePosts], 'date').reverse();
}

function getHeadings(file) {
  const headingLines = file.split('\n').filter((line) => line.match(/^###*\s/));

  return headingLines.map((line) => ({
    text: line.replace(/^###*\s/, ''),
    level: line.slice(0, 3) === '###' ? 3 : 2,
  }));
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .use(prism, { showSpotlight: true })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  const headings = getHeadings(fileContents);

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    headings,
    ...matterResult.data,
  };
}

export function getSeries(seriesName) {
  const posts = getSortedPostsData();

  return posts.find((p) => p.seriesName === seriesName) || null;
}
