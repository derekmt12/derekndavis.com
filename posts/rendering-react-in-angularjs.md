---
title: 'Rendering React in AngularJS'
series: 'Migration to React Series'
seriesId: 'migration-to-react'
sequence: 2
date: '2020-01-01'
tags: ['react', 'javascript']
excerpt:
  'When migrating an AngularJS app to React we need a way to use
  React components in an AngularJS template. That’s where
  `react2angular` comes in...'
---

When migrating an AngularJS app to React we need a way to use React
components in an AngularJS template. That’s where `react2angular`
comes in. While the name sounds like the opposite of what we’re
trying to accomplish, its purpose is to help bring React into an
Angular app.

Here’s an example of what defining a component is like.

```javascript
import { react2angular } from 'react2angular';

function TextComponent({ text }) {
  return <div>{text}</div>;
}

angular.module('someModule')
  .component('reactText', react2angular(TextComponent, ['text']]));
```

And when we use it in a template, it looks just like an AngularJS
component.

```html
<react-text text="'hello world'"></react-text>
```

One particularly helpful thing to do here is with the naming. By
prefixing your `react2angular` components with “react”, it helps
developers to know what components have been converted when looking
at the Angular templates.

## In Summary

- Rendering React in AngularJS is straight forward with
  `react2angular`
- Prefix `react2angular` component names with "react" to help your
  team remember what has been converted
