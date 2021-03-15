import React, { useState } from 'react';
import {
  faEnvelopeOpenText,
  faAngleDoubleRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

export default function Subscribe({ className }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function subscribe(e) {
    e.preventDefault();

    const res = await fetch('/api/subscribe', {
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const response = await res.json();

    if (response.error) {
      setMessage(response.error);
      return;
    }

    setEmail('');
    setMessage('Thank you! You have been subscribed 🎉');
  }

  return (
    <section className={className}>
      <div className="mx-auto px-4 sm:px-3 max-width relative">
        <div
          className={classNames(
            'shadow-lg rounded px-4 pb-4 py-2 border-t-4 transform sm:scale-105 md:scale-110 overflow-hidden',
            'bg-blue-100 border-blue-400'
          )}
        >
          <h3 className="text-2xl font-bold text-blue-800">
            You've got <span className="line-through ">mail</span> JavaScript.
          </h3>

          <p className="text-blue-400 mb-4">
            Sign up to get notified when I put out new content!
          </p>

          <form onSubmit={subscribe} className="relative">
            <FontAwesomeIcon
              icon={faEnvelopeOpenText}
              className="-z-10 w-24 h-24 transform rotate-12 absolute right-0 text-blue-200 -mt-4 sm:-mt-16"
            />
            <input
              className="px-2 py-1 rounded shadow w-64 mr-3 mb-3"
              name="email"
              id="email"
              placeholder="tom@myspace.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded bg-pink-500 text-white block sm:inline-block"
            >
              Subscribe
              <FontAwesomeIcon
                icon={faAngleDoubleRight}
                className="w-4 h-4 ml-1 mb-1 inline text-pink-300"
              />
            </button>
          </form>
          <div className="text-blue-800">{message}</div>
        </div>
      </div>
    </section>
  );
}
