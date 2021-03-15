---
title: 'Clean Up Your useEffect, But Not Too Much'
subtitle: 'The pitfalls of an implied cleanup function'
date: '2021-01-11'
tags: ['javascript', 'reactjs']

image: 'nhu-nguyen-IL1qSqEMNBo-unsplash.jpg'
imageAltText: 'lit up MacBook Pro keyboard'
imageWidth: 2400
imageHeight: 1600
photographer: 'Nhu Nguyen'
photographerLink: 'https://unsplash.com/@nguyendqnhu'

urlPath: '/posts/clean-up-your-useeffect-but-not-too-much'
---

Like a lot of developers, I love to write code that is to the point
and stripped of all the fluff. Something about getting code down to
its smallest form is really satisfying. Although, at a certain
point, conciseness and maintainability are tugging on opposite ends
of the same strand.

Where this has particularly bitten me is with the cleanup function of
a `useEffect`.

## The Scenario

We start with a really simple useEffect.

```javascript
useEffect(() => thing.register(), []);
```

Nothing special, right? Well, let's say later on we come back in
here and decide brackets would look nicer, so it gets changed.

```javascript
useEffect(() => {
  thing.register();
}, []);
```

Except... we have a problem now. These do not behave the same way.
What we forgot is that `thing.register()` actually returns an
`unregister` function that needs to be called in the effect cleanup.
So what we should have done was this:

```javascript
useEffect(() => {
  // now works the same as the implied return
  return thing.register();
}, []);
```

## Conciseness vs. Maintainability

Let's consider this setup though.

Will we (or anyone else on our team) remember in 6 months that
`register()` returns an `unregister` function that `useEffect` will
call in its cleanup? We can only hope. The implied return in that
first example makes it even more "magic."

Instead of hoping we remember that, let's instead create an
intermediate variable to make it more clear.

```javascript
useEffect(() => {
  const unregister = thing.register();
  return unregister;
}, []);
```

It's not as concise as the original, but I could come back after a
long period of time and know exactly what that code is doing.

## Summary

- After refactoring, consider the impact to the maintainability of
  your code.
- Make it clear when a `useEffect` has a cleanup function to avoid
  future defects.
