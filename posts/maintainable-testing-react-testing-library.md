---
title: 'Solving the Maintenance Nightmare with React Testing Library'
subtitle: 'How test render functions help us write maintainable tests'
date: '2021-04-02'
tags: ['javascript', 'reactjs', 'unittesting']

image: 'neonbrand-60krlMMeWxU-unsplash.jpg'
imageAltText: 'mechanic tools'
imageWidth: 2400
imageHeight: 1600
photographer: 'NeONBRAND'
photographerLink: 'https://unsplash.com/@neonbrand'

urlPath: '/posts/maintainable-testing-react-testing-library'
---

Writing tests is a crucial part of quality software, and with [React](http://reactjs.org/), the go-to solution is [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). But if we're not careful, our test suite can turn into a maintenance nightmare.

Let's fix that.

## Test Render Function

The best thing we can do for the maintainability of our tests is to have a single function that renders our component and queries its elements. We'll call it a test render function.

[Kent C. Dodds](https://twitter.com/kentcdodds) mentions this approach in his article on [test isolation](https://kentcdodds.com/blog/test-isolation-with-react#even-better), and it has the potential to transform the way you write your tests.

Here's an example:

```javascript
import { render, screen } from '@testing-library/react';
import ToDoScreen from './ToDoScreen';

describe('ToDoScreen', () => {
  function renderToDoScreen() {
    render(<TodoScreen />);

    return {
      name: screen.getByLabelText('Task'),
      add: screen.getByText('Add')
    };
  }

  it('should add a task', () => {
    const { name, add } = renderToDoScreen();

    // ...
  });
});
```

Let's dig into what this approach gives us.

### Keep Tests Easy to Read

Have you ever read through a test and it took way longer than it should have to understand what was going on? Querying logic adds an extra layer of code we have to sift through to get to what we're _really_ after: the scenario.

Here's an example of inlining all the queries:

```javascript
it('should close the form after add', async () => {
  render(<PersonScreen />);

  // open the form
  fireEvent.click(screen.getByText('Toggle Form'));

  // fill it out
  fireEvent.change(
    screen.getByLabelText('Name'),
    { target: { value: "Derek" } }
  );

  // click add
  fireEvent.click(screen.getByText('Add'));

  // the form should now be closed
  expect(screen.queryByLabelText('Name')).toBeNull();
});
```

To be honest, it's not that bad for small tests like this, but when the tests get bigger, it's harder to get past the noise and understand the scenario.

Let's change it to use a test render function and compare.

```javascript
it('should close the form after add', async () => {
  const { toggleForm, form } = renderPersonScreen();

  // open the form
  fireEvent.click(toggleForm);

  // fill it out
  fireEvent.change(
    form.name,
    { target: { value: "Derek" } }
  );

  // click add
  fireEvent.click(form.add);

  // the form should now be closed
  expect(form.name).toBeNull();
});
```

I'm not sure about you, but I like this a lot better. When reading a test, do we really care if the button came from `getByText`, `getByRole`, or `getByTestId`? Having a test render function helps our tests focus on scenarios and not get bogged down with targeting UI elements. The steps should be obvious. Everything else is just implementation detail.

### Predictable Tests

The results of running a test by itself should be the same as running it with all the tests in a suite. Setting global variables during tests can cause failures when running tests together if any of those variables aren't reset properly in a [`beforeEach`](https://jestjs.io/docs/api#beforeeachfn-timeout).

A test render function isolates each test so they're more predictable. Let's look at an example:

```javascript
describe('AsyncSelect', () => {
  function renderAsyncSelect() {
    const fetchOptions = jest.fn();

    render(
      <AsyncSelect
        getOptions={fetchOptions}
        {/* other props */}
      />
    )

    return {
      fetchOptions,
      openMenu: // ...
    };
  }

  it('should call the fetch after the menu opens', () => {
    const { fetchOptions, openMenu } = renderAsyncSelect();

    expect(fetchOptions).not.toHaveBeenCalled();

    openMenu();

    expect(fetchOptions).toHaveBeenCalled();
  });

  it('should call the fetch on search', () => {
    const { fetchOptions, openMenu } = renderAsyncSelect();

    expect(fetchOptions).not.toHaveBeenCalled();

    // ...
  });
});
```

In the above example, we had two tests back to back making assertions on the `fetchOptions` mock, and this works without any extra thought because the mock is rebuilt in the test render function.

Consider the alternative:

```javascript
describe('AsyncSelect', () => {
  let fetchOptions = jest.fn();

  function renderAsyncSelect() {
     // ...
  }

  // ...
});
```

If we did this, we'd have a problem. The mock isn't being reset between tests, so the tests would pass individually, but fail when ran as a group. 

This is the kind of thing that makes you question your career choice. And it's all because we forgot we needed a `beforeEach`.

```javascript
let fetchOptions;

beforeEach(() => {
  fetchOptions = jest.fn();
});
```

Using a test render function removes this problem altogether, and we don't even need to think about it.

### Centralizes Queries

Querying UI elements directly in our tests causes extra work when our HTML structure changes or there's a change in a newer version of a third party component we use or even React Testing Library itself. We would then have to go around to every failing test to fix it.

If all of our querying is centralized in a test render function, we only have to correct the problem in one place.

### Reusable Components

So far we've been talking about test render functions for a single file, but we can expand that to the most reusable components in our codebase: modals, date pickers, dropdowns, etc.

Most, if not all, of our tests interact with these kinds of components. If we decide to switch from one third party dropdown to another, we would have to go update every test to fix it.

We can avoid that nightmare by building test helpers for these components so that swapping out a third party component just requires an update to our test helper.

## Summary

- Test render functions help us solve the maintenance nightmare.
- Abstracting query logic makes our tests easier to read.
- Isolating tests makes them more predictable.
- Centralizing queries and writing test helpers for the most reusable components future proofs our tests.