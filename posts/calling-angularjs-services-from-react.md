---
title: 'Calling AngularJS Services from React'
seriesId: 'migration-to-react'
sequence: 2
date: '2020-01-01'
tags: ['react', 'javascript']
excerpt: 'First off, why would you want to call an AngularJS service from
React? It is likely there are global services...'
---

First off, why would you want to call an AngularJS service from
React? It is likely there are global services that haven’t been
converted to React yet that still need to be used. It’s a lot easier
and less error-prone to use the Angular service directly rather than
attempting to synchronize state with a copy of the same service in
React.

A big part of the AngularJS design is the digest cycle. It checks
for changes in state and then updates the DOM. When doing all
development within AngularJS, you almost never have to think about
it. Digests are triggered at all the likely times that state
changes: button clicks and when HTTP calls and timers complete. But
calling AngularJS code from React is taking it outside this
environment, and it takes extra steps to tell AngularJS what's going
on.

## AngularJS Services in React

We start with a basic React component that calls an AngularJS
service to increment a counter.

```javascript
import { react2angular } from 'react2angular';

const exampleModule = angular.module('exampleModule', []);

function IncrementButton({ counterService }) {
  return (
    <button
      type="button"
      onClick={() => counterService.increment()}
    >
      Increment
    </button>
  );
}

exampleModule.component(
  'reactIncrementButton',
  react2Angular(IncrementButton, ['counterService'])
);
```

Next we have our `counterService`. Nothing revolutionary here. Just
a count and an increment method.

```javascript
exampleModule.factory('counterService', () => {
  let count = 0;

  return {
    count,
    increment() {
      count++;
    },
  };
});
```

And here is our AngularJS component to pull it all together. We pass
in the `counterService` as a prop to the React component and display
the count in the template.

```javascript{3,7,9}
exampleModule.component('example', {
  controller: function (counterService) {
    this.counterService = counterService;
  },
  template: `
      <div>
        {{counterService.count}}
        <react-increment-button
          counter-service="counterService"
        >
        </react-increment-button>
      </div>
    `,
});
```

After running this, clicking the increment button doesn't appear to
work, but that’s not entirely true. The count is actually being
incremented in the state, but Angular doesn’t know it has changed.
It doesn’t own the increment button, so a digest cycle is not being
triggered to update the count in the DOM.

To fix this, we need to give Angular a little help by telling it to
kick off a digest. The way we do that is by wrapping the service
before we hand it to React.

```javascript
exampleModule.factory(
  'reactCounterService',
  (counterService, $rootScope) => {
    function increment() {
      // call the original
      counterService.increment();
      // digest!
      $rootScope.$apply();
    }

    return { ...counterService, increment };
  }
);
```

Then we need to make one little update in our component's
controller. We'll now use the `reactCounterService` instead.

```javascript{2-3}
exampleModule.component('example', {
  controller: function (reactCounterService) {
    this.counterService = reactCounterService;
  },
  template: `
      <div>
        {{counterService.count}}
        <react-increment-button
          counter-service="counterService"
        >
        </react-increment-button>
      </div>
    `,
});
```

Now when the button is clicked, AngularJS knows to update the DOM,
and the count is displayed correctly.

## Creating a React Context for an Angular Service

In a lot of cases, the services passed down from Angular are global
and should be accessible throughout the React component tree. The
best way to solve that problem is to set up a React context. Let's
make a context for our `counterService`.

```javascript
// counterContext.js

import React, { useContext } from 'react';

const CounterContext = React.createContext();

export function CounterProvider({ counterService, ...props }) {
  return (
    <CounterContext.Provider value={counterService} {...props} />
  );
}

export function useCounter() {
  return useContext(CounterContext);
}
```

Now let's use this new context provider to wrap our
`IncrementButton` when its passed to `react2Angular`.

```javascript{11,13}
import React from 'react';
import react2Angular from 'react2Angular';
import { useCounter, CounterProvider } from './counterContext';

// ...

exampleModule.component(
  'reactIncrementButton',
  react2Angular(
    ({ counterService, ...props }) => (
      <CounterProvider counterService={counterService}>
        <IncrementButton {...props} />
      </CounterProvider>
    ),
    ['counterService']
  )
);
```

At this point, you might be asking what we've gained by making this
context. I'll admit this is a contrived example. Considering
`IncrementButton` is literally just a button, it wasn't necessary.
But if our `IncrementButton` was a whole React screen, having that
`counterService` available at any level in the component tree is
extremely helpful.

One thing you'll also notice is that the component definition got a
lot more verbose just by adding that single provider. In a larger
app, there will likely be several global providers for things like
routing, internationalization, toast notifications, and caching. The
next post "Migration to React Series: Multiple React Roots" deals
with how to make defining these React root components really simple.

## In Summary

- AngularJS only updates the DOM when there is a digest cycle
- Calling AngularJS services from React typically requires manually
  running the digest cycle with `$rootScope.$apply()`
- Wrapping the global service in a React context will allow it to be
  called at any level of the component tree
