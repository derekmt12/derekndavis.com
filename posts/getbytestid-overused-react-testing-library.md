---
title: 'getByTestId: The Most Overused Query in React Testing Library'
subtitle: 'Changing our habits to have greater confidence in our test suite'
date: '2022-04-07'

tags: ['reactjs', 'unittesting']

image: 'imattsmart-jaLaLQdkBOE-unsplash.jpg'
imageAltText: 'hammer'
imageWidth: 2400
imageHeight: 1600
photographer: 'iMattSmart'
photographerLink: 'https://unsplash.com/@imattsmart'

urlPath: '/posts/getbytestid-overused-react-testing-library'
---
  
When it comes to element queries in [React Testing Library](https://testing-library.com/docs/react-testing-library/intro), [`getByTestId`](https://testing-library.com/docs/queries/bytestid) is typically the one we reach for. We know there are probably better options, but we're in a hurry. It's the crutch that a lot of us never move on from because it works, and well... why bother?

Let's finally look past "the usual" and see how we're missing out on a critical aspect of shipping well-tested code.

## What Is the Point of Testing?

Before we get to `getByTestId`, let's first talk about our goal in testing. We want to have confidence that our application works as expected for our users in all scenarios. To do this, we make explicit assertions to verify its behavior. These are easy to spot.

```javascript
expect(searchInput).toBeDisabled();
```

On the other hand, implicit assertions come in the form of the queries we choose.

```javascript
const searchInput = screen.getByLabelText('Search');
```

In this example, we're saying, "We expect this input to have a label of 'Search', and it should be linked with matching `id` and `for` attributes."

It's our query choice that give us a new level of confidence. We're testing our app just like our users.

Have you ever wondered why `getByClassName` and `getById` are not first-class citizens? This is because the pit of success in React Testing Library is to make good query choices. If not, we'd miss out on the assertions that verify our element labels and accessibility, two very important things for our users.

## Okay, What's So Bad About `getByTestId`?

Simply put, accessing everything through test ids isn't testing your application the way a user would, which is our ultimate goal. We're relying on an arbitrary id, an implementation detail, to access a DOM node. This certainly works, but there's plenty of room for improvement.

Aside from the accessibility benefits of other queries, when we use `getByTestId`, we actually have to put a test id on things we need to access. Most of the time, it's just not necessary, and we end up shipping extra code to the user that has no benefit to them.

## What We're Missing

Instead of immediately reaching for `getByTestId`, try one of these first. 

### `getByRole`

[`getByRole`](https://testing-library.com/docs/queries/byrole/) should be our go-to selector. It queries an element and, at the same time, verifies it is accessible with the correct role and text.

```html
<button>Click</button>
```

```javascript
const button = screen.getByRole('button', { name: 'Click' });
```

### `getByLabelText`

[`getByLabelText`](https://testing-library.com/docs/queries/bylabeltext) is a great query for form elements, since this is how we interact with them in the first place. By using this query, we're also verifying our labels are properly linked to our inputs with `for` and `id` attributes.

```html
<label for="name">Name</label>
<input type="text" id="name" />
```

```javascript
const name = screen.getByLabelText('Name');
```

### `getByText`

When the above two queries aren't an option, [`getByText`](https://testing-library.com/docs/queries/bytext) will at least access elements based on text visible to the user.

```html
<p>An unexpected error occurred.</p>
```

```javascript
const errorMessage = screen.getByText(
  'An unexpected error occurred.'
);
```

### `getByPlaceholderText`

Sometimes all you have is a placeholder to query an element, and that is still better than a test id.

```html
<input type="text" placeholder="Search..." />
```

```javascript
const search = screen.getByPlaceholderText('Search...');
```

## When `getByTestId` Isn't So Bad

Everything in moderation, right? The biggest advantage of `getByTestId` isn't for directly accessing a particular element. If an element has static text, we probably should be querying it through other means. Where `getByTestId` comes into play is defining containers and accessing elements with dynamic text.

### `getByTestId` for Defining Containers

We can sometimes have more than one UI element of the same type showing at the same time: search inputs, delete buttons, expand/collapse buttons... The list goes on. This is where defining a container with a test id is useful. To narrow down a query, it helps to limit it to a particular panel or area of our interface.

```html
<section data-testid="settingsPane">
  <h2>Settings</h2>
  <input type="Search..." />
```

Here, we're using the `within` function from React Testing Library to query inside our container.

```javascript
const settingsPane = within(
  screen.getByTestId('settingsPane')
);
const search = settingsPane.getByPlaceholder('Search...');
```

In addition, we also may want to determine if the container is visible or not in certain scenarios. For simple cases where the component owns all or at least a piece of static content in the container, it's better to target a main element, like a heading, to verify its existence or non-existence.

```javascript
expect(
  screen.queryByRole('heading', { name: 'Settings' }
).toBeInTheDocument();
```

If we don't have anything like this, using a test id is a good fallback.

```javascript
expect(
  screen.queryByTestId('settingsPane')
).toBeInTheDocument();
```

Another great use-case for `getByTestId` is for testing lists. In [Within Reach: Testing Lists with React Testing Library](/posts/testing-lists-react-testing-library), we define our "containers" as `<li>` tags and query the UI elements for each item.

### `getByTestId` for Accessing Elements with Dynamic Text

For certain cases where we have dynamic text, `getByTestId` is a good way to access the element.

In the component below, we're displaying a sorted list of users.

```javascript
function UsersList({ users }) {
  const sortedUsers = [...users]
    .sort((a, b) => a.name > b.name ? 1 : -1);
  return (
    <ul>
      {sortedUsers.map(user => (
        <li key={user.id} data-testid="user">
          <h2>{user.name}</h2>
          <span data-testid="role">{user.role}</span>
        </li>
      ))}
    </ul>
  );
}
```

For this component, we want to verify all the information is rendered in the appropriate slots and sorted by name. The method we're going to use I describe in [Within Reach: Testing Lists with React Testing Library](/posts/testing-lists-react-testing-library), but let's dig into our query choices here.

Notice we have an `h2` for the name and a `span` for the role. We could easily place a test id on both elements and move on, but just because we have dynamic content doesn't mean we always need `getByTestId`. We should still prioritize other queries, like `getByRole`, to access elements.

In our [test render function](/posts/maintainable-testing-react-testing-library), we grab the user name with `getByRole` and the role with `getByTestId`.

```javascript{14}
function renderUsersList() {
  const users = [
    { id: 0, name: 'Pam', role: 'Receptionist' },
    { id: 1, name: 'Dwight', role: 'Salesman' },
  ];

  render(<UsersList users={users} />);

  return {
    get users(){
      const users = screen.getAllByTestId('user');
      return users.map(user => ({
        name: within(user)
          .getByRole('heading').textContent,
        role: within(user).getByTestId('role').textContent,
      }));
    },
  }
}
```

We're verifying the name is rendered as a heading, and our explicit assertion checks the list is sorted with the correct values.

```javascript
it('should render the users in sorted order', () => {
  const { users } = renderUsersList();

  expect(users).toEqual([
    { name: 'Dwight', role: 'Salesman' },
    { name: 'Pam', role: 'Receptionist' },
  ]);
});
```

## Summary

- Use `getByRole` or `getByLabelText` before reaching for `getByTestId`.
- `getByTestId` is good for defining containers and querying elements with dynamic text, but it should not be the default query we use for everything.
- To quickly test how a query works, [Testing Playground](https://testing-playground.com/) is a great tool.
- For more information on queries and how to choose the right one, check out the [list of queries in priority order](https://testing-library.com/docs/queries/about/#priority).