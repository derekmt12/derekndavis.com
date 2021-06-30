---
title: 'Fix Your Failing Tests: A Debugging Checklist for React Testing Library'
subtitle: 'Solutions to the most common React testing issues'
date: '2021-05-30'
tags: ['javascript', 'reactjs', 'unittesting']

image: 'jexo-yVxUC9I9Cik-unsplash.jpg'
imageAltText: 'writing unit tests'
imageWidth: 2400
imageHeight: 1600
photographer: 'Jexo'
photographerLink: 'https://unsplash.com/@jexo'

urlPath: '/posts/debugging-checklist-react-testing-library'
---

When you get stuck fixing your [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) tests, it's hard to remember all the tips and tricks for every issue, and you don't always have a coworker available to help get back on track. But typically, all it takes is asking the right questions.

Today, I'm going to be your coworker. Let's fix those tests.

### Making this Process Quicker

Before we get started, I would recommend taking a couple minutes (literally) to read  [3 Steps to Frictionless TDD with Jest and VS Code](/posts/3-steps-to-frictionless-tdd-with-jest-and-vscode). It will make the debugging process go much smoother, and you'll be happy you did.

And with that, let's begin.

## Can't Find My Element

Not being able to find an element is generally a symptom of something else, but it is the most common problem you'll run into. You might be seeing one of these errors:

```wrapcontent
Unable to find an element with the text: ${text}. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
```

```wrapcontent
Unable to fire a ${event.type} event - please provide a DOM element.
```

The most important thing to figure out are the conditions that determine when the element is rendered and go through them one by one.

### A Query Typo

Starting with the most common issue, verify that your query (`getByText`, `getByRole`, `getByPlaceholderText`, `getByTitle`, `getByTestId`) matches the attributes you're targeting on the element. Copy and paste the correct text to make sure a typo isn't what's causing the issue.

### API Mocking

- Are you missing an API call that should be mocked?
- Did you mock your API call with the wrong data?
- Does your API response not meet the conditions to render that element?

For verifying API responses, `console.log()` is your friend.

```javascript
getUser(userId).then((user) => {
  // verify your API call is getting the correct response
  console.log('getUser ', user);

  setUser(user);
});
```

**Pro Tip**<br/>
If your code looks like this:

```javascript
getUser(userId).then((user) => setUser(user));
```

You don't have to add curly braces to fit in your `console.log()`. You can do this little trick to save some time:

```javascript
getUser(userId).then((user) => 
  console.log(user) || setUser(user)
);
```

### `setTimeout` and `setInterval`

If your code is using a `setTimeout` or `setInterval` and the callback for it plays a part in making your element show up, save yourself the headache, and put this line at the top of your test file:

```javascript
jest.useFakeTimers();
```

Now your test doesn't have to wait on real time to elapse.

Read more about the timer mocks in the [Jest Docs](https://jestjs.io/docs/timer-mocks).

### Using `Promise.all`? `waitFor` it... `waitFor` it...

Another issue you might run into with elements not showing up is with [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). Say your code looks like this:

```javascript
Promise.all([
    getUser(userId),
    getUserPermissions(userId)
]).then(([user, permissions]) => {
    // set state to make `myElement` show up
});
```

Wrap your assertion in a [`waitFor`](https://testing-library.com/docs/dom-testing-library/api-async/#waitfor) to allow `Promise.all` to resolve.

```javascript
await waitFor(() => expect(myElement).toBeInTheDocument());
```

This would also apply to using other `Promise` methods like [`Promise.allSettled`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) or [`Promise.race`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race).

### `screen.debug()` Your Queries

When your query can't find a particular element, you need to see what React Testing Library is seeing, and [`screen.debug()`](https://testing-library.com/docs/queries/about/#screendebug) is your window into that. If you have a small component, calling `screen.debug()` without any parameters will be sufficient. But if your component is really big, the output will be truncated, and that doesn't help very much.

Instead, it's better to narrow down what you're looking for. You can put a temporary `data-testid` on the container of the element you're targeting, and print that out. Now you won't have to sift through 7000 lines of HTML in a terminal.

```javascript
screen.debug(screen.getByTestId('tempContainerId'));
```

If you really want to see more than 7000 lines of output, [which is the default](https://testing-library.com/docs/dom-testing-library/api-debugging/#automatic-logging), it can be changed like this:
```javascript
DEBUG_PRINT_LIMIT=10000 npm test
```

## Element Is Not Supposed to be There, But It Is

Sometimes you need to ensure that an element is no longer in the DOM, but your test isn't cooperating. Here are a couple of things to try to get in the green again.

### Stale Query

One problem you may have in verifying the element is gone is a stale query. Here's the setup:

```javascript
const hideNameButton = screen.getByText('Hide Name');
const name = screen.queryByText('Derek');

// name should be there
expect(name).not.toBeNull();

// hide it
fireEvent.click(hideNameButton);

// name should not be there.. but it still is :(
expect(name).toBeNull();
```

In the final assertion, name isn't re-queried. It's stale.

For most test suites, I recommend the solution I discuss in my article on [targeting conditional elements](/posts/query-conditional-elements-react-testing-library). But for a quick fix, you can also inline the queries:

```javascript
// name should be there
expect(screen.queryByText('Derek')).not.toBeNull();

// hide it
fireEvent.click(hideNameButton);

// name should not be there
expect(screen.queryByText('Derek')).toBeNull();
```

### `waitForElementToBeRemoved`

Another way of solving this problem is the [`waitForElementToBeRemoved`](https://testing-library.com/docs/dom-testing-library/api-async/#waitforelementtoberemoved) function. This is more useful in cases where the element may not be removed immediately after some action. Maybe it makes an API call and the promise callback is what removes it. In that case, you could do this:

```javascript
// name should be there
expect(screen.queryByText('Derek')).not.toBeNull();

// delete the person
fireEvent.click(deletePersonButton);

// name should not be there
await waitForElementToBeRemoved(() => 
  expect(screen.queryByText('Derek')).toBeNull()
);
```

## My Test Passes When Ran by Itself, But Fails When Ran with Other Tests

One of the most frustrating situations is when a test passes by itself, but as soon as you run the whole suite, it fails. Here are a few things to check to solve that problem.

### Are You Forgetting an `async` Somewhere?

Probably the most common cause of tests that fail when ran together is a missing `async`. When a test runs an operation that needs to be `await`ed but doesn't have one, it's effectively running that code after the test has completed. This can potentially wreak havoc on the next test, causing it to fail.

To make sure you're not missing an `async` with React Testing Library functions, you can use [eslint-plugin-testing-library ](https://github.com/testing-library/eslint-plugin-testing-library). This will warn you if you're using `async` unnecessarily or you're missing it entirely.

As for your own functions that you're calling from your test, you'll just have to look over them carefully to make sure you're not missing the `async` keyword.

### Do You Have Global Variables in Your Test Suite?

If you're mutating global variables in your test suite, it could lead to some strange issues when running all the tests together.

```javascript
let user = {
  userName: 'user1'
};

it('should do something', () => {
  // mutating a global variable
  user.userName = 'user2';

  // ...
});

it('should do something else', () => {
  // user.userName is now 'user2' for this test. whoops!
});
```

One way to solve this is using a `beforeEach`:

```javascript
let user;

beforeEach(() => {
  user = {
    userName: 'user1'
  };
});
```

But a better way is to use a [test render function](/posts/maintainable-testing-react-testing-library):

```javascript
function renderUser({ user }) {
  render(<User user={user} />);

  return {
    // ... information and controls in the User component ...
    saveButton: screen.getByText('Save')
  };
}

it('should ...', () => {
  const { saveButton } = renderUser({ user: { userName: 'user1' } });

  // ...
});
```

This pattern completely removes the question of "did I forget to reset my variables in `beforeEach`?"

### Is Your Component Mutating Global Data?

It's also possible that your component is mutating global variables. Maybe there's data that is set in `localStorage`, `sessionStorage`, or (heaven forbid) on the `window` object during the run of one of your tests. If the next test is expecting to work with a clean copy of those storage mechanisms, that can cause a problem.

Make sure you're resetting those variables in your [test render function](/posts/maintainable-testing-react-testing-library) or `beforeEach`.

## My `react-router` Params Are Undefined

When you're testing a component directly that is rendered under a [react-router](https://reactrouter.com/) `Route` component in your app, you've got to make sure the path is the same in both contexts. For instance, say you have this in your app:

```javascript
<Route path={['/users', '/users/:companyId']}>
  <UserScreen />
</Route>
```

In your test, you have to render the component with the same path:

```javascript
render(
  <MemoryRouter>
    <Route path={['/users', '/users/:companyId']}>
      <UserScreen />
    </Route>
  </MemoryRouter>
);
```

Let's say you forget and only do part of the path:

```javascript
render(
  <MemoryRouter>
    <Route path="/users">
      <UserScreen />
    </Route>
  </MemoryRouter>
);
```

Then when you try to access `companyId` from `useParams`, it will be undefined because it was never declared in the route definition.

```javascript
const { companyId } = useParams();

console.log(companyId); // undefined
```

So if your route parameters aren't changing after clicking links or doing a `history.push` in your test, the first thing to check is the path.

## Summary

- Testing can become really frustrating when you get stuck debugging a long list of failing tests.
- Use this checklist to get back in the green again.

Hey! If this helped you fix a failing test, please share!

If you've got suggestions for other fixes to common testing scenarios, let me know, so it can help others.