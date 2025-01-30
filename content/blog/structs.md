---
title: "A Voyage to Structs"
date: 2025-01-29T08:15:00+05:30
description: ""
subtitle: "without getting lost."
tags: ["c++", "programming"]
draft: true
---
### Motivation
I'm back, albeit a little rusty! It'd been a while since I've written anything; life got in the way - new job, new priorities, and all that jazz and I'm not exactly sure what prompted me to dust off my portfolio today. Perhaps it was the domain renewal email or perhaps it was the realization that two years have passed since I started writing an article that's still lingering in draft form, waiting for its chance to shine (or be completely rewritten). But today I'm dusting myself off and diving back in, ready to share some fresh thoughts. Join me, if you will, on a voyage to structs.

> Note that this article is entirely focused on structs in C++, majority of the concepts here will apply to C, and some might even apply to other [C-family languages](https://en.wikipedia.org/wiki/List_of_C-family_programming_languages), but no promises.

### Introduction
Quoting cppreference,

> A struct is a type consisting of a sequence of members whose storage is allocated in an ordered sequence.

If you read it carefully, that sounds a lot like arrays, but the catch here is that, it doesn't say anything about the data type of the members, which means we can have members with separate data types, either fundamental or compound. Due to which, structs can't be laid out in memory as uniformly as arrays. But thankfully, the C++ gods have thought of a solution for this problem, which I will discuss later in the article.

Now, in the definition it says, "A struct is a type", let's see what are all the various things "type" means in this context,
- an user defined type
- a compound type, (also sometimes called composite data types) are types that are defined in terms of other existing data types
- a class type, is a type that is a `struct`, `class`, or `union` 
- a program-defined type
> The C++20 language standard defines the term “program-defined type” to mean class and enumerated types that are not defined as part of the standard library, implementation, or core language. In other words, “program-defined types” only include class and enum types that are defined by us (or a third-party library).

### Defining Structs
As structs are program-defined types, we must first describe them to the compiler before use. Structs can or can not have a name (also called a _type tag_). If there's no name then they are known as anonymous structs, and as one would expect, it can't be referenced again. It is useful only in some special contexts, such as inside a `typedef` or a `union`.

Let's start out on how the structs are defined in C, next we will see some additional ideas added by C++.
```c
struct Direction {
    int dx;
    int dy;
};

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

Direction north; // no need for `struct`
north.dx = 0;
north.dy = -1;
```

```c
struct Node {
    int val;
    Node* next; // no need for `struct`
};
```
### Initializing Structs
In the previous section, to keep the examples simple, I have instantiated the structs and assigned the values one by one. It may be considered as one form of initialization but it is not a good practice to do so. In a way it violates the _always initialize_ rule from the [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#es20-always-initialize-an-object). Reason; as the values are set individually, there is always a chance of overlooking a few. Later on when the uninitialized members are accessed then they will lead to undefined behavior (garbage values) or used-before-set errors.

To correctly initialize a struct we first have to get familiar with _aggregates_. 

#### What is an _aggregate_?
The formal definition of an aggregate has changed throughout the C++ standards. There have been few rules added and few removed, however the following stayed consistent throughout all the standards.

> An _aggregate_ is any data type with multiple members, it can either be an array type or a class type with:
> - no private or protected non-static data members
> - no virtual member functions
>
> _An up-to-date and precise definition can be found [here](https://en.cppreference.com/w/cpp/language/aggregate_initialization)._

After reading it, you might be eager to conclude that structs are always aggregates but that is not true.

In C++, classes and struct are the same except for their default behaviour with regards to inheritance and access levels of members. For classes both are private whereas for struct both are public. Because of this classes and structs can be used interchangeably, and so there is a possibility of a _non-aggregate_ struct. I am going to keep them for another time as they are more of a class feature than a struct feature. But all in all, it is safe to say that structs with only data members can be considered as aggregates, which is going to be the focus of this article.

Before delving into _aggregate-initialization_, let's take a short detour.

#### Value-initialization
_Value-initialization_ happens when a variable is initialized using an empty brace-enclosed initializer list (since _C++11)_.

If a scalar type (`bool`, `int`, `char`, `double`, pointers, etc.) is initialized this way then they are zero-initialized.
```cpp
double d {}; // value-initialized to 0.0
int* p {}; // value-initialized to NULL 
```
Whereas, for aggregate types if this form of initialization is used then _aggregate-initialization_ is performed instead.

#### Aggregate-initialization
There are four ways to initialize an aggregate, all of which are various forms of [list-initialization](https://en.cppreference.com/w/cpp/language/list_initialization).
- Initializing an aggregate with an ordinary initializer list.
1. `T object = { arg1, arg2, ... };`
2. `T object { arg1, arg2, ... };` (since _C++11_)
- Initializing an aggregate with designated initializers (applicable only to class types).
3. `T object = { .des1 = arg1 , .des2 { arg2 } ... };` (since _C++20_)
4. `T object { .des1 = arg1 , .des2 { arg2 } ... };` (since _C++20_)

Here, 2 and 4 are termed _direct list initialization_ and, 1 and 3 are termed _copy list initialization_.

##### initializing with ordinary initializer lists
This syntax (_1, 2_) is commonly used when initializing arrays, which can be generalized to aggregates.
```cpp
int oneDigitPrimes[]{2, 3, 5, 7}; // or oneDigitPrimes[] = {2, 3, 5, 7}
int* oneDigitPrimesHeap = new int[]{2, 3, 5, 7};
```
is equivalent to,
```cpp
int oneDigitPrimes[4]{2, 3, 5, 7}; // or oneDigitPrimes[4] = {2, 3, 5, 7}
int* oneDigitPrimesHeap = new int[4]{2, 3, 5, 7};
```
In the above example, there wasn't a need of mentioning the size, as it can be deduced by the compiler from the brace-enclosed initializer list. However, it can be explicitly mentioned as well, resulting in following three scenarios:
1. the array size is equal to the initializer list size (size can be omitted, like the above example)
2. the array size is less than the initializer list size (this will lead to a compiler error)
3. the array size is greater than the initializer list size (each array element is initialized in the order of declaration and the others are initialized from an empty initializer list)
```cpp
int f[26]{0}; // 1st element is assigned 0, others are value-initialized (to 0)
int m[26]{}; // all the elements are value-initialized (to 0)
int z[] = {}; // Error: cannot declare an array without any element
```
These points hold true even for structs but with a slightly modified point 3,
- all the members without any initializer in the initializer list having a default value are assigned that value. And the other members are initialized from an empty initializer list i.e., value-initialized.
```cpp
struct Person {
    std::string name;
    int age {-1};
    double height;
};

Person person1; // name = "", age = -1, height = undefined behavior
Person person2 {}; // name = "", age = -1, height = 0.0
Person jane {"Jane Doe"}; // age = -1, height = 0.0
Person john {"John Doe", 22}; // height = 0.0
```
> Note that `person1.name` was initialized with empty string even without the explicit declaration. This is so because the varaible was initialized with an empty initializer list, which in turn invoked the default constructor leading to an empty string.
```cpp
struct Address {
    std::string city;
    std::string state = "CA";
    int zip = 90001;
};

struct Person {
    std::string name;
    int age {-1};
    double height;
    Address address;
};

Person person1 {}; // address will be initialized like so `Address address {};`
Person person2 {"Jane", 21, 180, {"LA"}}; // or `{"Jane", 21, 180, "LA"}`
```
Above `person2` was initialized in a nested form, usually seen if the members are aggregates. The inner braces can be omitted provided the sequence of values match that of an aggregate flattened.
```cpp
int a[2][3] = {{1, 2, 3}, {4, 5, 6}}; // same as `{1, 2, 3, 4, 5, 6}` 
```
```cpp
struct Student {
    int id {-1};
    char name[20];
    int marks[3];
};

struct Course {
    Student student;  // Nested structure
    double grade;
};

Course c1 = {{1234, "Alice", {85, 90, 88}}, 90.5};
// same as `{1234, "Alice", 85, 90, 88, 90.5}`

// if `marks[2]` is unknown
Course c2 = {1111, "Bob", {90, 95}, 91};
// omitting the braces will lead `91` getting assigned to `marks[2]`
```
See how ambigious and error prone it becomes just by omitting the braces? When used correctly, it might save you a few keystrokes, but you would be shooting yourself in the foot in the long run!

Below is an [example from cppreference](https://en.cppreference.com/w/cpp/language/aggregate_initialization#Explicitly_initialized_elements) summarizing various scenarios,
```cpp
struct base1 {
    int b1, b2 = 42;
};
 
struct base2 {
    int b3;
    base2() { b3 = 42; }
};
 
struct derived : base1, base2 {
    int d;
};
 
derived d1{{1, 2}, {}, 4}; // initializes d1.b1 with 1, d1.b2 with 2,
                           //             d1.b3 with 42, d1.d with 4
derived d2{{}, {}, 4};     // initializes d2.b1 with 0, d2.b2 with 42,
                           //             d2.b3 with 42, d2.d with 4
```
> Note that if there is a user declared default constructor (like in `base2`), then value-initialization will invoke it instead of value initializing the members. 

##### initializing with designated initializers
A designated initializer, or designator, points out a particular element to be initialized. A designator list is a comma-separated list of one or more designators. They must appear in the same order as the order of declaration. All the members without a designator having a default value are assigned that value. And the other members are initialized from an empty initializer list, similar to the above section.
```cpp
struct Person {
    std::string name;
    int age {-1};
    double height;
};

Person person { .name = "Jane", .height = 180.0 }; // age = -1
```

Though this syntax (_3, 4_) has been around since _C99_, it made its debut (only for class types) in _C++20_ with subtle differences.

Out-of-order designated initialization, nested designated initialization, mixing of designated initializers and regular initializers, and designated initialization of arrays are all supported in C, but are not allowed in C++.
```cpp
struct A { int x, y; };
struct B { struct A a; };
 
struct A a = {.y = 1, .x = 2}; // valid C, invalid C++ (out of order)
int arr[3] = {[1] = 5};        // valid C, invalid C++ (array)
struct B b = {.a.x = 0};       // valid C, invalid C++ (nested)
struct A a = {.x = 1, 2};      // valid C, invalid C++ (mixed)
```

This form of initialization is sometimes helpful when new members are added to the definition.
```cpp
struct S {
    int a;
    int c;
};

S s1 {.a = 1, .c = 2};
S s2 {1, 2}; // a = 1, c = 2
```
In the example below, another member is added in between, the list initialization will need changes, but no changes are required for the designated initialization.
```cpp
struct S {
    int a;
    int b;
    int c;
};

S s1 {.a = 1, .c = 2}; // no change here
S s2 {1, 2}; // b will get assigned 2 here
```
Note that the above scenario is only useful if and only if in all initialization/assignment occurances designated initializers are used. That is why it is good practice to add any new members at the bottom so that the other members don't shift.

Last but not least, we can have a combination of both list and designated initialization when initializing a nested aggregate.
```cpp
struct Student {
    int id {-1};
    char name[20];
    int marks[3];
};

struct Course {
    Student student;  // Nested structure
    double grade;
};

Course c = {{.name = "Alice", .marks = {85, 90, 88}}, 90.5};
```

#### Initializing from a Struct
Let's say we have a struct and we want to initialize another struct with the same values, _C++_ provides a rather intuitive way to do so without the need of explicit initialization of each member. It can be as straightforward as using `operator=`, which is also know as _copy initialization_.
```cpp
struct Node {
    int val;
    struct Node* next;
};

Node last = { 2 };
Node first = { 1, &second };
Node middle = first; // copy initialization
first = { .val = 0, .next = &middle };
```
In addition to the above form of initialization, there are two more syntax forms called _direct initialization_ and _direct-list initialization_.
1. `T object2 = object1; // copy initialization`
2. `T object2(object1); // direct initialization`
3. `T object2 { object1 }; // direct-list initialization`

Now you might be wondering how these type of initializations work since we have not defined any constructor or overloaded `operator=`. It works because the compiler generates a copy constructor if it is not provided, and all the syntax forms simply invoke it.

The following example explicitly defines two constructors, _default_ and _copy_, and shows that all the syntax forms discussed above call the _copy constructor_.
```cpp
struct Node {
    int val;
    struct Node* next;

    Node() { std::cout << "default ctor invoked\n"; } 
    Node(const Node& other) { std::cout << "copy ctor invoked\n"; }
};

Node d; // default ctor invoked
Node a = d; // copy ctor invoked
Node b(a); // copy ctor invoked
Node c{b}; // copy ctor invoked
```

### Assigning Structs
There will be times when not all the values of struct members are known at initialization. Later on, when the values become known, one option is to assign individually but there is always a chance of overlooking a few. The following section discusses about a couple approaches to correctly assign structs.
#### assigning with initializer lists
Of the four list-initialization forms described above, two _(1, 3)_ can be used during assigning values. To refresh your memory, these two forms of initialization are called _copy list initialization_.
1. `object = { arg1, arg2, ... };`
2. `object = { .des1 = arg1 , .des2 { arg2 } ... };` (since C++20)

Let's revisit an earlier example,
```cpp
struct Person {
    std::string name;
    int age {-1};
    double height;
};

Person person { .name = "Jane", .height = 180.0 };
std::cout << "Enter date of birth: ";
std::string dob;
std::cin >> dob;
person = { .name = person.name, .age = calc_age(dob) }; 
```
Here, `age` was value-initialized to `-1` at the time of initialization, later on it gets calculated and assigned. Since no changes were required in `name`, it was provided the earlier value. However, `height` got missed and gets value-initialized to `0.0`, replacing the existing value.

#### assigning another struct using `operator=`
The syntax is similar to that of initializing from a struct using `operator=`.
- `object2 = object1;`

But here in this case, it doesn't invoke the copy constructor. The compiler generates an overloaded assignment operator if it is not provided, which gets invoked here. This simply replaces the existing values with that of the values from the right hand side struct. 
```cpp
struct A {
    A() { std::cout << "default ctor invoked\n"; }
    A(const A& other) { std::cout << "copy ctor invoked\n"; }
    A& operator=(const A& other) { std::cout << "operator= invoked\n"; }
};

A a; // default ctor invoked
A b = a; // copy ctor invoked
a = b; // operator= invoked
```

### Structs and Functions
#### passing structs as argument
#### returning structs

### Structs and Memory
#### the `alignas` specifier
### Flexible array members
### Arrays and Structs—_two sides of the same coin_
Along with the ones we saw so far, below are few more similarities and differences between arrays and structs I find noteworthy,
- In an array, the address of the first element is same as the address of the array, the same is true for structs.
- In structs, there may be unnamed padding between any two members of a struct or after the last member, but not before the first member.
- Arrays can be thought of as structs having elements with same data type and no padding in between, which makes the array's size calculation easier, which is simply the multiplication of the number of elements and the size of the data type. But the size of a struct is _at least_ as large as the sum of the sizes of its members.

### Conclusion
