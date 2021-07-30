---
title: 'Stop Serving Context Soup with Your React Testing Library Tests'
subtitle: 'Write more maintainable tests by abstracting global context providers'
date: '2021-07-30'
tags: ['reactjs', 'unittesting']

image: 'fidel-fernando-val59UQ3PqU-unsplash.jpg'
imageAltText: 'bowl of soup'
imageWidth: 2400
imageHeight: 1600
photographer: 'Fidel Fernando'
photographerLink: 'https://unsplash.com/@fifernando'

urlPath: '/posts/react-context-soup-react-testing-library'
---

If you've worked on a production [React](https://reactjs.org/) app for any amount of time, you've probably noticed the accumulation of [`Provider`](https://reactjs.org/docs/context.html#contextprovider) components that wrap the top level component. When it comes to writing tests, these contexts become an extra hurdle to set up new test files.

We have to make sure all [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) usages in the component are covered. One missing `Provider`, and we get failing tests.

```javascript
// don't forget one!
render(
  <GlobalCacheProvider>
    <I18nProvider i18n={i18n}>
      <NotificationProvider>
        <UserScreen />
      </NotificationProvider>
    </I18nProvider>
  </GlobalCacheProvider>
);
```

And what happens when there's a new global context added?

We have a couple options:
1. Add it it to all the test suites hoping we don't miss one.
2. Go the lazy route and only add it to the test suite using it. This creates a landmine for our coworkers (or our future selves), so when they use the new context, the tests are missing the `Provider` and fail. Gee, thanks!

We can solve both of these problems with one solution.

## The Context Wrapper

Let's create a wrapper component called `GlobalTestProvider` that includes all our global context `Provider` components.

```javascript
function GlobalTestProvider({ i18n, children }) {
  return (
    <GlobalCacheProvider>
      <I18nProvider i18n={i18n}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </I18nProvider>
    </GlobalCacheProvider>
  );
}
```

Then the line to render the component becomes much more palatable:

```javascript{2,4}
render(
  <GlobalTestProvider i18n={i18n}>
    <UserScreen />
  </GlobalTestProvider>
);
```

Not to mention, when we add a new context, there's only one place to do it, and all test suites get updated together. Boom.

## Summary

- Reduce friction in creating new tests and make them more maintainable by creating a wrapper component that includes all global context providers.