---
title: 'Multiple React Roots in AngularJS'
subtitle:
  'Managing multiple React root components in an incremental
  migration'
seriesName: 'Migration to React Series'
seriesSubtitle: 'Convert your AngularJS app to React'
seriesId: 'migration-to-react'
sequence: 4
date: '2020-12-24'
tags: ['reactjs', 'angularjs']

image: 'zach-reiner-hW11fwjzVfA-unsplash.jpg'
imageAltText: 'tree roots in front of a waterfall'
imageWidth: 2400
imageHeight: 1600
photographer: 'Zach Reiner'
photographerLink: 'https://unsplash.com/@_zachreiner_'

urlPath: '/posts/multiple-react-roots-in-angularjs'
---

One of the biggest challenges with incrementally migrating an app to
[React](https://reactjs.org/) is how to manage multiple React “root” components. In a brand
new React app, this isn’t a concern, since there’s a single
top-level component. If there are any global providers, they're
always at the top.

<!-- prettier-ignore -->
```javascript
ReactDOM.render(<App />, document.getElementById('root'));

function App() {
  return (
    <GlobalCacheProvider>
      <NotifierProvider>
        {/* components */}
      </NotifierProvider>
    </GlobalCacheProvider>
  );
}
```

_The basic setup for a React app_

However, in a migration scenario, there are multiple top-level
components. Maybe only the user editing screen and product viewing
screen have been converted to React. These components will need all
the global providers typically found in an App component and may
need to access shared state, like app configuration,
internationalization, a router or cache.

![An AngularJS app with multiple React root components](/images/reactRootDiagram.png)
_An AngularJS app with multiple React root components_

## An Easy Way to Create React Root Components

When managing multiple React roots, it is important to have an easy
way to "Angularize" React components and wrap them in all the global
providers. Creating a helper function hides away the complexity of
shared state and services when defining a new React root.

The `buildReactRoot` function is what we'll use to define our new
React root components.

```javascript
// buildReactRoot.js

import React from 'react';
import GlobalCacheProvider from '...';
import NotifierProvider from '...';

export default function buildReactRoot(
  WrappedComponent,
  propNames = []
) {
  return react2Angular(
    ({ reactRoot, ...props }) => (
      <GlobalCacheProvider cacheService={reactRoot.cacheService}>
        <NotifierProvider notifier={reactRoot.notifier}>
          <WrappedComponent {...props} />
        </NotifierProvider>
      </GlobalCacheProvider>
    ),
    propNames,
    ['reactRoot']
  );
}
```

Let's break this function down.

```javascript{6,9,14}
export default function buildReactRoot(
  WrappedComponent,
  propNames = []
) {
  return react2Angular(
    ({ reactRoot, ...props }) => (
      <GlobalCacheProvider cacheService={reactRoot.cacheService}>
        <NotifierProvider notifier={reactRoot.notifier}>
          <WrappedComponent {...props} />
        </NotifierProvider>
      </GlobalCacheProvider>
    ),
    propNames,
    ['reactRoot']
  );
}
```

We're passing `['reactRoot']` as an argument to `react2Angular`.
This parameter specifies that the `reactRoot` Angular Service should
be passed as a prop to the component.

Since we're destructuring the the props, we pass everything else
(other than `reactRoot`) onto the `WrappedComponent`. This allows us
to still pass props from Angular code directly to the component.

Let's define the `reactRoot` service that includes the shared global
services.

```javascript
// appModule.js

import userModule from './userModule';
import { createCache } from '...';

const cacheService = createCache();

angular
  .module('app', [userModule.name])
  .factory('reactRoot', (notifier) => {
    return {
      cacheService,
      notifier,
    };
  });
```

We used `userModule` above, but we haven't defined that yet. We'll
build that out next to define a React component with the new React
root setup.

```javascript
// userModule.js

import React from 'react';
import { react2angular } from 'react2angular';
import buildReactRoot from './buildReactRoot';

// a component that uses the notifier and cache providers
function UserScreen() {
  const notifier = useNotifier();
  const cache = useCache();

  return (
    // ...
  );
}

// defining the component is just a single line of code!
const userModule = angular.module('userModule', [])
  .component('reactUserScreen', buildReactRoot(UserScreen)));

export default userModule;
```

Now when we use that component in an Angular UI Router state
definition, we treat it as a normal Angular component, and we don't
have to pass any global services to it. `reactRoot` does all of that
for us behind the scenes.

```javascript{4}
$stateProvider.state({
  name: 'user',
  url: '/user',
  template: `<react-user-screen></react-user-screen>`,
});
```

## Passing Props from Angular

We can also pass props from Angular by listing them in the component
definition.

```javascript
// userModule.js

// ...

const userModule = angular.module('userModule', [])
  .component(
    'reactUserScreen',
    buildReactRoot(UserScreen, ['currentUser']))
  );

```

Then we can just pass them in like Angular component bindings.

```javascript{5,9}
$stateProvider.state({
  name: 'user',
  url: '/user',
  controller: function (currentUser) {
    this.currentUser = currentUser;
  },
  template: `
    <react-user-screen
      current-user="currentUser"
    >
    </react-user-screen>
  `,
});
```

## Shared State Between Root Components

An important thing to note about having multiple root components is
that global state cannot be held inside React. It could be in the
Angular code or just in a plain function. This is so it can be part
of the `reactRoot` service, which is passed to each React root
component.

In the above example, the cache service was created in the
`appModule.js` file and added to `reactRoot`.

```javascript{6,12}
// appModule.js

import userModule from './userModule';
import { createCache } from '...';

const cacheService = createCache();

angular
  .module('app', [userModule.name])
  .factory('reactRoot', (notifier) => {
    return {
      cacheService,
      notifier,
    };
  });
```

Then in `buildReactRoot`, we passed the `cacheService` to the
`GlobalCacheProvider`, which gives each React root access to the
shared service.

```javascript{7}
export default function buildReactRoot(
  WrappedComponent,
  propNames = []
) {
  return react2Angular(
    ({ reactRoot, ...props }) => (
      <GlobalCacheProvider cacheService={reactRoot.cacheService}>
        <NotifierProvider notifier={reactRoot.notifier}>
          <WrappedComponent {...props} />
        </NotifierProvider>
      </GlobalCacheProvider>
    ),
    propNames,
    ['reactRoot']
  );
}
```

## In Summary

- An incremental migration to React requires an easy way to wrap new
  React root components in global providers.
- A single AngularJS service of all global state and services helps
  facilitate defining new React root components.
- All global state needs to be held outside of React.
