---
title: "The Last Stop: Structs and Memory"
date: 2025-02-11T07:49:56+05:30
description: "Part 3"
subtitle: ""
tags: ["c++", "programming"]
draft: true
---
### Structs and Memory
#### the `alignas` specifier
### Flexible array members
### Arrays and Structs—_two sides of the same coin_
Along with the ones we saw so far, below are few more similarities and differences between arrays and structs I find noteworthy,
- In an array, the address of the first element is same as the address of the array, the same is true for structs.
- In structs, there may be unnamed padding between any two members of a struct or after the last member, but not before the first member.
- Arrays can be thought of as structs having elements with same data type and no padding in between, which makes the array's size calculation easier, which is simply the multiplication of the number of elements and the size of the data type. But the size of a struct is _at least_ as large as the sum of the sizes of its members.
