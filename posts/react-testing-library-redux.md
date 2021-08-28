---
title: "Using Redux? React Testing Library Doesn't Care!"
subtitle: "Why your state management doesn't matter to your test suite"
date: '2021-08-28'
tags: ['reactjs', 'unittesting', 'redux']

image: 'timotheus-wolf-522TVIOVSOY-unsplash.jpg'
imageAltText: 'ducks'
imageWidth: 2400
imageHeight: 1600
photographer: 'Timotheus Wolf'
photographerLink: 'https://unsplash.com/@tmjc_wolf'

urlPath: '/posts/react-testing-library-redux'
---

If you're using [Redux](https://redux.js.org/) for state management, you might be wondering how to use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) to test your [React](https://reactjs.org/) code. The beauty of React Testing Library is that it doesn't care about implementation details! Even if you're using [jQuery](https://jquery.com/) in your `useEffect`, it won't judge you. You render your component and make assertions on the resulting DOM all the same.

Don't believe me? Let's take a look at testing a component using Redux versus one using React state.

## Our Redux App Under Test
In [Within Reach: Testing Lists with React Testing Library](/posts/testing-lists-react-testing-library), we tested a simple component that manages a list of characters from The Office. We're going to use this as our system under test again because we all could use a little more Dwight Schrute in our lives.

I've refactored it to use Redux for state management to see how testing it might change. I'm using `createSlice` from [`@reduxjs/toolkit`](https://redux-toolkit.js.org/) to build a reducer and actions for managing the character list.

```js
import { createSlice } from '@reduxjs/toolkit';

const charactersSlice = createSlice({
  name: 'characters',
  initialState: [],
  reducers: {
    add(state, action) {
      state.unshift(action.payload);
    },
    remove(state, action) {
      state.splice(state.indexOf(action.payload), 1);
    }
  }
});
```

There's a `buildStore` function that configures the store and loads it with a few characters.

```js
function buildStore() {
  const store = configureStore({
    reducer: charactersSlice.reducer,
    preloadedState: [
      'Michael Scott',
      'Dwight Schrute',
      'Jim Halpert'
    ]
  });
  return store;
}
```

The `OfficeCharacters` component pulls the characters from the store with `useSelector` and renders them. It uses `dispatch` to add or remove characters using the actions from our `charactersSlice`.

```js
function OfficeCharacters() {
  const dispatch = useDispatch();
  const characters = useSelector((state) => state);
  const [newCharacter, setNewCharacter] = useState('');

  function add(e) {
    e.preventDefault();
    dispatch(actions.add(newCharacter));
    setNewCharacter('');
  }

  function deleteCharacter(character) {
    dispatch(actions.remove(character));
  }

  return (
    <>
      <form onSubmit={add}>
        <label htmlFor="newCharacter">New Character</label>
        <input
          type="text"
          id="newCharacter"
          value={newCharacter}
          onChange={(e) => setNewCharacter(e.target.value)}
        />
        <button>Add</button>
      </form>
      <ul>
        {characters.map((character, i) => (
          <li key={i} data-testid="character">
            <span data-testid="name">{character}</span>{' '}
            <button
              type="button"
              onClick={() => deleteCharacter(character)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

## Setting Up the Test Suite with a Redux Store
The first thing we want to do is take a look at our [test render function](/posts/solving-maintenance-nightmare-with-react-testing-library). We're wrapping our component in a Redux `Provider`, and that's really the only thing that needs to change.

It's a good thing we're using a test render function here because otherwise, we would have had to do this for every single test. Also, if you have multiple context providers in your tests other than just Redux, take a look at how to setup a [`GlobalTestProvider`](/posts/react-context-soup-react-testing-library#the-context-wrapper) to make this simpler across your whole app.

```js{2,5,7}
function renderOfficeCharacters() {
  const store = buildStore();

  render(
    <Provider store={store}>
      <OfficeCharacters />
    </Provider>
  );

  return {
    newCharacter: screen.getByLabelText('New Character'),
    addButton: screen.getByText('Add'),
    getCharacters() {
      return screen.getAllByTestId('character').map((item) => ({
        name: within(item).getByTestId('name').textContent,
        deleteButton: within(item).getByText('Delete')
      }));
    }
  };
}
```

One important note here is that we're building the store _inside_ the test render function. We want a fresh store with every test. If not, we would be forced to run the tests in the same order every time, and life's too short for that frustration.

## Writing the Tests
If you read the testing lists article, guess what? The tests are the exact same! There's not even a hint they're testing a Redux application (and that's the way it should be).

```js
it('should add a character', () => {
  const {
    newCharacterInput,
    addButton,
    getCharacters
  } = renderOfficeCharacters();

  const pam = 'Pam Beesly';

  // verify pam is NOT in the initial list
  expect(
    getCharacters().find(
      (character) => character.name === pam
    )
  ).toBeFalsy();

  // add pam
  fireEvent.change(
    newCharacterInput,
    { target: { value: pam } }
  );
  fireEvent.click(addButton);

  // verify pam is first in the list
  expect(
    getCharacters().findIndex(
      (character) => character.name === pam
    )
  ).toBe(0);
});
```

```js
it('should delete a character', () => {
  const { getCharacters } = renderOfficeCharacters();

  const jim = 'Jim Halpert';

  const deleteJim = getCharacters().find(
    (character) => character.name === jim
  ).deleteButton;

  // delete character
  fireEvent.click(deleteJim);

  // verify Jim is NOT in list
  expect(
    getCharacters().find(
      (character) => character.name === jim
    )
  ).toBeFalsy();
});
```

You can use Redux or plain-old React state, and largely, the tests don't even have to change.

Here's the CodeSandbox to view the full solution:

<iframe
  src="https://codesandbox.io/embed/redux-and-react-testing-library-6p0ox?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.spec.js&previewwindow=tests&theme=dark&view=editor"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Redux and React Testing Library"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## Summary
- React Testing Library doesn't care about implementation details, so testing with Redux is no different than just using React state.
- Setup a Redux store in your test render function, and you're all good.