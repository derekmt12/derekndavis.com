---
title: 'Put Down the Destructuring Hammer'
subtitle: 'A practical guide to using destructuring when it makes sense'
date: '2021-02-18'
tags: ['javascript', 'reactjs', 'angular', 'vuejs']

image: 'shane-aldendorff-3AzL-IR3v7Y-unsplash.jpg'
imageAltText: 'camera parts'
imageWidth: 2400
imageHeight: 1600
photographer: 'Shane Aldendorff'
photographerLink: 'https://unsplash.com/@pluyar'

urlPath: '/posts/put-down-the-destructuring-hammer'
---

Destructuring is one of JavaScript's most handy features. Once I wrapped my head around the odd-looking syntax, I was a big fan of what it can do. I mean, what's not to love? If we want to destructure a property, we can do it.

Objects? We can destructure that.

```javascript
const { firstName, lastName } = person;
```

Arrays? We can destructure that.

```javascript
const [person, setPerson] = useState(null);
```

An array of objects in an object? We can destructure that too.

```javascript
const {
  firstName,
  lastName,
  employmentHistory: [
     { company, startDate, endDate, title }
  ]
} = person;
```

It even works on strings, believe it or not.

```javascript
const { length } = "hello"; // But don't do this. Just no.
```

What about if we want to default a value if there's not one? No problem.

```javascript
const { firstName = 'Derek', lastName = 'Davis' } = person;
```

But with all that power, there's potential for problems.

## Naming Clashes

Once we go down the path of destructuring, we'll inevitably run into the next most common problem it causes: variable naming clashes.

```javascript
const { firstName, lastName } = person1;
// whoops! can't do that.
const { firstName, lastName } = person2;
```

`firstName` and `lastName` are taken. So what do we do? Destructuring has an answer for that.

```javascript
const {
    firstName: person1FirstName, 
    lastName: person1LastName
} = person1;
const {
    firstName: person2FirstName,
    lastName: person2LastName
} = person2;

// ... later on ...

alert(`
    hello ${person1FirstName} ${person1LastName}
    and ${person2FirstName} ${person2LastName}!
`);
```

We've renamed our properties to fix the error, but what have we gained? We have several hideous lines of JavaScript, and we can use `person1FirstName` without putting a dot in it.

### Dot Notation to the Rescue

Check this out.

```javascript
// the destructuring lines are gone! 

// ... later on ...

alert(`
    hello ${person1.firstName} ${person1.lastName}
    and ${person2.firstName} ${person2.lastName}!
`);
```

If we use dot notation, we don't have to destructure anything, we don't have the variable naming conflict, we have less code, and it's more readable!

Let's look at another example.

## The Lure of Shorthand Property Names

Shorthand property names are one of my favorite features in JavaScript. I love how clean the syntax looks.

```javascript
// old school
setPerson({ name: name, city: city });

// shorthand property names. so clean.
setPerson({ name, city });
```

But sometimes we can have tunnel vision when we're trying to use this feature. If what we have to destructure is deeply nested, we've only created more noise.

```javascript
const {
    name,
    demographics: { address: { city } }
} = person; // a game of match the brackets

setPerson({ name, city });
```

So what's the answer?

### Dot Notation Again

We've gotten rid of the destructuring and all those brackets. It's so much more readable this way.

```javascript
// no destructuring

setPerson({
  name: person.name,
  city: person.demographics.address.city
});
```

But hey, maybe you don't want to use _all_ the dots. Destructuring only the top level properties keeps things readable.

```javascript
// just the right amount of destructuring
const { name, demographics } = person;

setPerson({
  name,
  city: demographics.address.city
});
```

What's easy to forget is that dot notation and destructuring can be used in combination for better readability. For instance, if we want to pull out the properties of `address`, we can do this:

```javascript
// not ideal
const {
    demographics: { address: { city, state, zip } }
} = person;

// so much better
const { city, state, zip } = person.demographics.address;
```

Destructuring is one of those features that's great in its flat form, but when it becomes nested, the readability starts to degrade quickly.

## Naming Ambiguity

Imagine this. You're trying to understand an area of your application you're not familiar with. You're 200 lines into one of the files, and you come across a variable called `name`. There's not a local declaration of it; it's just being used for something, and you have no idea what it is. So you go hunting and find this:

```javascript
const { name, address, phone } = company;
```

In this case, using destructuring created an overly generic variable name because it removed the context of where it came from. If it hadn't been destructured, `company.name` would have been totally clear. No variable hunting required.

When we decide to destructure something, keep it as close to where it's being used as possible, especially if the variable name is generic.

## Summary

- When destructuring causes naming clashes, it's a code smell. It might be okay, but then again, it also might be a sign you shouldn't be using destructuring.
- Prefer keeping destructuring as flat as possible to avoid a mess of brackets. Using dot notation and destructuring in combination can help keep things flat.
- Destructured objects should be as close as possible to where they are used to help readability. Overly generic names make code hard to understand.