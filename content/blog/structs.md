---
title: "A Voyage to Structs"
date: 2024-12-25T19:05:02+05:30
lastmod: 2024-12-25T19:05:02+05:30
description: ""
tags: ["c++", "programming"]
draft: true
---
I'm back, albeit a little rusty! It'd been a while since I've written anything; life got in the way - new job, new priorities, and all that jazz and I'm not exactly sure what prompted me to dust off my portfolio today. Perhaps it was the domain renewal email or perhaps it was the realization that two years have passed since I started writing an article that's still lingering in draft form, waiting for its chance to shine (or be completely rewritten). But today I'm dusting myself off and diving back in, ready to share some fresh thoughts. Join me, if you will, on a voyage to structs.

> Note that this article is entirely focused on structures in C++, majority of the concepts here will apply to C, and some might apply to other languages, but no promises.

#### Introduction
Quoting cppreference,

> A struct is a type consisting of a sequence of members whose storage is allocated in an ordered sequence.

If you read it carefully, that sounds a lot like arrays, but the catch here is that, it doesn't say anything about the data type of the members, which means we can have members with separate data types, either fundamental or compound. Due to which, structs can't be laid out in memory as uniformly as arrays. But thankfully, the C++ gods have thought of a solution for this problem, which I will discuss later in the article.

Now, in the definition it says, "A struct is a type", let's see what are all the various things "type" means in this context,
- an user defined type
- a compound type, (also sometimes called composite data types) are types that are defined in terms of other existing data types
- a class type
- a program-defined type
> The C++20 language standard defines the term “program-defined type” to mean class and enumerated types that are not defined as part of the standard library, implementation, or core language. In other words, “program-defined types” only include class and enum types that are defined by us (or a third-party library).

#### Defining Structs
As structs are program-defined types, we must first describe them to the compiler before use. Structs can or can not have a name (also called a _type tag_). If there's no name then they are known as anonymous structs, and as one would expect, it can't be referenced again. It is useful only in some special contexts, such as inside a `typedef` or a `union`.

Let's start out on how the structs are defined in C, next we will see some additional ideas added by C++.
```c
struct Direction {
    int dx;
    int dy;
};
...
// initialization
struct Direction north;
north.dx = 0;
north.dy = -1;
```
Notice during initialization how we had to mention `struct` again. This is because `Direction` is defined in the _tag name space_, not mentioning `struct` would lead the compiler to search for it in the _ordinary identifier name space_ and lead to a compiler error.
> The C language standard ([C89](http://port70.net/~nsz/c/c89/c89-draft.txt), [C99](http://port70.net/~nsz/c/c99/n1256.html#6.2.3), and [C11](http://port70.net/~nsz/c/c11/n1570.html#6.2.3)) mandates separate name spaces for different categories of identifiers, including tag identifiers (for `struct`/`union`/`enum`) and ordinary identifiers (for `typedef` and other identifiers).

The following example declares an anonymous struct and creates a `typedef` for it. Thus, with this construct, it doesn't have a name in the _tag name space_. Hence no need to prefix `struct` everytime it is referenced.
```c
typedef struct {
    int dx;
    int dy;
} Direction;
...
// initialization
Direction north;
north.dx = 0;
north.dy = -1;
```
However this is often considered a bad practice. Refer the [Linux kernel coding styling guidelines](https://www.kernel.org/doc/html/latest/process/coding-style.html#typedefs) to learn more.

Another disadvantage of this type of definition is that since it is an anonymous struct, we can't have something like below. Here, the definition refers recursively to the same structure.
```c
struct Node {
    int val;
    struct Node* next;
};
```

In C++, the _tag name space_ still exists, but all names are automatically added to both the _tag name space_ and the _ordinary identifier name space_, thus reducing program's verbosity.
```cpp
struct Direction {
    int dx;
    int dy;
};
...
// initialization
Direction north; // no need for `struct`
north.dx = 0;
north.dy = -1;
```

#### Initializing Structs


#### Arrays and Structs
In an array, the address of the first element is same as the address of the array, the same is true for structs. In structs, there may be unnamed padding between any two members of a struct or after the last member, but not before the first member.

Arrays can be thought of as structs having elements with same data type and no padding in between, which makes the array's size calculation easier, which is simply the multiplication of the number of elements and the size of the data type. But the size of a struct is **at least** as large as the sum of the sizes of its members.
