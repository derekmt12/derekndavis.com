---
title: 'Wary of the Query: Targeting Conditional Elements with React Testing Library'
subtitle: 'How one JavaScript feature makes querying conditional elements predictable'
date: '2021-03-15'

tags: ['reactjs', 'unittesting']

image: 'loic-leray-fCzSfVIQlVY-unsplash.jpg'
imageAltText: 'man walking on tight rope'
imageWidth: 2400
imageHeight: 1597
photographer: 'Loic Leray'
photographerLink: 'https://unsplash.com/@loicleray'

urlPath: '/posts/query-conditional-elements-react-testing-library'
---

One problem I frequently run into when testing is that conditionally rendered parts of the UI can be difficult to target with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). As I'm planning out my tests, I continually ask myself questions like:
- When am I able to query this element?
- Is the query stale?
- Do I need to query it again?

It all feels like a tight rope act to get it right.

Typically I get the answers to those questions when the `Unable to find an element ...`  error pops up in the terminal. Then I end up having to sift through debug output to check if React Testing Library is lying to me or not (it never is).

If you've ever found yourself in this situation, I've got a solution you'll find useful.

## The Basic Test Setup

We're going to be writing a test for the `PersonScreen` component. It's just a form with a name field and an add button.

```javascript
function PersonScreen() {
  const [name, setName] = useState('');

  function add(e) {
    // ...
  }

  return (
    <form onSubmit={add}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button>Add</button>
    </form>
  );
}
```

When I write a test suite for a component, the first thing I do is make a `render{ComponentName}` function at the top of my [`describe`](https://jestjs.io/docs/api#describename-fn). I call this a [test render function](/posts/maintainable-testing-react-testing-library). For the `PersonScreen` component, my render function would look something like this:

```javascript
import { render, screen } from '@testing-library/react';
import PersonScreen from './PersonScreen';

describe('PersonScreen', () => {
  function renderPersonScreen() {
    render(<PersonScreen />);

    return {
      name: screen.getByLabelText('Name'),
      add: screen.getByText('Add')
    };
  }

  // ... tests ...
});
```

This way all of the element querying is done in one centralized location, the tests are isolated, and they're easier to read.

But sometimes we can run into a problem with this approach.

## Conditionally Rendered UI

Let's change this component so the user can hide and show the form with a toggle button.

```javascript{3,8,12-16,29-30}
function PersonScreen() {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);

  function add(e) {
    // ...
    // close the form after add
    setShow(false);
  }

  return (
    <section>
      <button onClick={() => setShow((s) => !s)}>
        Toggle Form
      </button>
      {show && (
        <form onSubmit={add}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button>Add</button>
        </form>
      )}
    </section>
  );
}
```

Since the form is no longer shown when the first [`getByLabelText`](https://testing-library.com/docs/queries/bylabeltext) runs, it's going to produce an error in the console:

```wrapcontent
TestingLibraryElementError: Unable to find a label with the text of: Name
```

`queryByLabelText` would get rid of the error, but when we try to access `name`, it'll be null. What we need is a way to query the form elements _after_ they are shown while still keeping their queries centralized.

## The Function Approach

One way we can fix this is by having a `getForm()` function.

```javascript
function renderPersonScreen() {
  render(<PersonScreen />);

  function getForm() {
    return {
      name: screen.queryByLabelText('Name'),
      add: screen.queryByText('Add')
    };
  }

  return {
    toggleForm: screen.getByText('Toggle Form'),
    getForm
  };
}
```

We call it every time we want to access the form controls.

```javascript{8,17}
it('should close the form after add', () => {
  const { toggleForm, getForm } = renderPersonScreen();

  // open the form
  fireEvent.click(toggleForm);

  // get the form now that it's open
  let form = getForm();

  // fill out the form
  fireEvent.change(form.name, { target: { value: 'Derek' } });

  // click add
  fireEvent.click(form.add);

  // get the form again since it's now hidden
  form = getForm();

  // the form should now be closed
  expect(form.name).toBeNull();
});
```

This works, but it's annoying to have to call `getForm()` to access the controls on it, and then after something changes, call it again to get the most up to date results.

We can do better.

## Property Getters

Let's make a few tweaks to the render function. Instead of `getForm()`, we have a `form` property with `name` and `add` [property getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get).

```javascript
function renderPersonScreen() {
  render(<PersonScreen />);

  return {
    toggleForm: screen.getByText('Toggle Form'),
    form: {
      get name() {
        return screen.queryByLabelText('Name');
      },
      get add() {
        return screen.queryByText('Add');
      }
    }
  };
}
```

Now our test is even more simple:

```javascript{4}
it('should close the form after add', async () => {
  // now we destucture `form`, and we don't
  // have to call getForm() anymore
  const { toggleForm, form } = renderPersonScreen();

  // open the form
  fireEvent.click(toggleForm);

  // fill it out
  fireEvent.change(form.name, { target: { value: "Derek" } });
  
  expect(form.name.value).toBe("Derek");

  // click add
  fireEvent.click(form.add);

  // the form should now be closed
  // no need to requery `form.name`!
  expect(form.name).toBeNull();
});
```

With property getters, we get to use dot notation, we don't have to call `getForm()` to access our controls, and we don't have to worry about `form` being stale. We can have our cake and eat it too.

That's more like it.

<section style="color: rgba(43, 108, 176, 1); background-color: rgba(190, 227, 248, 1);" class="py-3 px-4 rounded">
  <h3 class="uppercase" style="margin-top: 0; font-size: 1em;">Note</h3>
  <p style="font-size: 0.9em;">
    One thing to note with this approach is that we can't <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment">destructure</a> the properties when using getters. The act of destructuring will call the getters, and then we're back to the problem we had in the first place.
  </p>
  <p style="margin-bottom: 0; font-size: 0.9em;">
    We can fix it by grouping the conditional elements in an object like we did in the above examples or not destructuring at all (<a href="/posts/put-down-the-destructuring-hammer">and sometimes that's not such a bad thing</a>).
  </p>
</section>

## Summary
- Targeting conditionally shown elements inside a centralized render function can be difficult in React Testing Library.
- Use JavaScript property getters to ensure your element queries aren't stale and improve the testing experience.