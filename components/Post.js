import Link from 'next/link';
import Image from 'next/image';

import Date from './date';

export default function Post({
  id,
  date,
  title,
  subtitle,
  image,
  imageAltText,
}) {
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
