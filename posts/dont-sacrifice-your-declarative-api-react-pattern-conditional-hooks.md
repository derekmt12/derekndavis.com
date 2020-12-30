---
title:
  "Don't Sacrifice Your Declarative API for One Use Case - A React
  Pattern for Conditional Hooks"
subtitle:
  'Designing React components that support declarative and
  imperative APIs'
date: '2020-12-29'

image: 'abraham-barrera-8Nn49K7Snow-unsplash.jpg'
imageAltText: 'aerial view on weaving concrete roads'
imageWidth: 2400
imageHeight: 1799
photographer: 'Abraham Barrera'
photographerLink: 'https://unsplash.com/@abebarrera?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText'
unsplashLink: 'https://unsplash.com/s/photos/interstate?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText'

urlPath: '/posts/dont-sacrifice-your-declarative-api-react-pattern-conditional-hooks'
---

Imagine this. You're designing a React component, and it's going
great. You've been able to elegantly handle all the use cases you
need in a declarative way. But then... You think of a new scenario
that doesn't fit into your design, and a wrench gets thrown into
your beautiful API. It needs to do something imperative like
manually reload a grid or reset a form. You've got the perfect API
for 90% of the use cases, but this one tiny requirement has ruined
it all. What do you do?

Believe me, I've been there. It's driven me crazy for a while, but I
finally came up with a pattern that solves it pretty well. Let me
show you.

## Let's Build a Grid

Let's say we're trying to make a paged grid component that fetches
its own data. This is going to be used everywhere in the company as
the go-to grid component, so we want to make it as simple as
possible for a developer to implement.

We set it up with a `source` prop for fetching the data, and call it
in a `useEffect` when the page number changes.

```javascript
function Grid({ source }) {
  const [data, setData] = useState({ values: [], count: 0 });
  const [page, setPage] = useState(1);

  // fetch data on page change
  useEffect(() => {
    getData();
  }, [page]);

  function getData() {
    // call the `source` prop to load the data
    return source(page).then((results) => {
      setData(results);
    });
  }

  return (
    // ...
  );
}
```

It would be used like this:

<!-- prettier-ignore -->
```javascript
function PersonGrid() {
  return (
    <Grid
      source={(page) =>
        fetch(`/api/people?page=${page}`)
          .then((res) => res.json())
      }
      // ...
    />
  );
}
```

This works great for really simple use cases. The developer just has
to import `Grid`, pass in `source`, and it just works.

## Here Comes the Wrench

Later on, functionality is added to the `PersonGrid` screen that
allows the user to add new people, and a problem arises. The `Grid`
controls the fetch, and since it doesn't know that a new person is
added, it doesn't know to reload. What we need is an external way of
handling the data. Let's refactor what we have to do that.

We'll move the state and fetching logic into its own hook called
`useGrid`, which makes the `Grid` component really simple. Its only
job now is to render data from the `instance` prop.

```javascript
function useGrid({ source }) {
  const [data, setData] = useState({ values: [], count: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    getData();
  }, [page]);

  function getData() {
    return source(page).then((results) => {
      setData(results);
    });
  }

  return {
    data,
    page
  };
}

function Grid({ instance }) {
  return (
    // ...
  );
}
```

In our `PersonGrid` component, we create our grid instance with the
hook and pass it to the `Grid`.

<!-- prettier-ignore -->
```javascript
function PersonGrid() {
  const grid = useGrid({
    source: (page) =>
      fetch(`/api/people?page=${page}`)
        .then((res) => res.json()),
  });

  return (
    <Grid
      instance={grid}
      // ...
    />
  );
}
```

With our data being handled in its own hook, that makes the reload
scenario straight forward.

```javascript{18}
function useGrid({ source }) {
  const [data, setData] = useState({ values: [], count: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    getData();
  }, [page]);

  function getData() {
    return source(page).then((results) => {
      setData(results);
    });
  }

  return {
    data,
    page,
    reload: getData
  };
}
```

Now after we add a person in `PersonGrid`, we just need to call
`grid.reload()`.

## Analyzing the APIs

Let's take a step back and analyze these two approaches based on the
scenarios.

The first iteration where the `Grid` was handling its fetching
internally was really easy to use. It only ran into issues when we
got into the data reloading scenario.

The second iteration using the `useGrid` hook made the data
reloading scenario simple, yet made basic use cases more complex.
The developer would have to know to import both `useGrid` and
`Grid`. This increase in surface area of the component API needs to
be taken into consideration, especially for the simple use cases.

We want to have the component-only API for simple use cases, and the
hook API for more complex ones.

## Two APIs, One Component

If we go back to the `Grid` component, we can include both the
`source` and `instance` props.

```javascript
function Grid({
  source,
  instance = useGrid({ source })
}) {
  // Any optional props that need to be used in here should
  // come through the `useGrid` hook.
  // `instance` will always exist, but the optional props may not.
  return (
    // ...
  );
}
```

Notice that we're getting `source` in as a prop, and we're using it
to create a `useGrid` instance for the `instance` prop.

With this pattern, we can have both component APIs. Going back to
the two different usages, they will both work now using the same
`Grid` component.

In this case, we use the `instance` prop (the `source` prop isn't
needed, since it's in the hook).

<!-- prettier-ignore -->
```javascript
function PersonGrid() {
  const grid = useGrid({
    source: (page) =>
      fetch(`/api/people?page=${page}`)
        .then((res) => res.json()),
  });

  return (
    <Grid
      instance={grid}
      // ...
    />
  );
}
```

And in this case, we use the `source` prop, which builds an instance
under the hood.

<!-- prettier-ignore -->
```javascript
function PersonGrid() {
  return (
    <Grid
      source={(page) =>
        fetch(`/api/people?page=${page}`)
          .then((res) => res.json())
      }
      // ...
    />
  );
}
```

## The Rules of Hooks

Now before you bring out your pitchforks and say "you can't
optionally call hooks!", hear me out. Think of why that is a rule in
the first place. Hooks must be always called in the same order so
the state doesn't get out of sync. So what that means is that a hook
must _always_ be called or it can _never_ be called.

In our new API, there will never be a case when a developer
conditionally provides the `instance` prop. They will either provide
the `instance` prop, which means the defaulted `useGrid` won't be
used, or they'll use the `source` prop, meaning the `useGrid` hook
will always be called. This satisfies the rules of hooks, but you'll
have to tell ESLint to look the other way.

## Summary

- Mixing declarative and imperative APIs can be difficult to produce
  the most simple API in all use cases
- Using a hook to control the component's logic and making it a
  default prop value allows both imperative and declarative APIs to
  coexist
