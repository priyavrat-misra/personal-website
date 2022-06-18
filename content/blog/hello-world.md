---
title: "Overengineering \"Hello, World!\"."
date: 2022-06-16T12:30:21+05:30
description: "Not for the faint of heart."
tags: ["c++", "programming"]
---

```cpp
#include <iostream>
using namespace std;
int main(int argc, char *argv[]) {
	cout << "Hello, World!\n";  // about time we make it a little interesting
	cout << "\110\145\154\154\157\54\40\127\157\162\154\144\41\12";
	cout << "\x48\x65\x6C\x6C\x6F\x2C\x20\x57\x6F\x72\x6C\x64\x21\xA";
	return 0;
}
```
All three `cout` statements will print the same thing i.e., `Hello, World!`. Try for yourself.

Now coming to the "how" part; in a nutshell, it has to do with **escape sequences**. Basically, they are used to represent characters which have special meaning in the language. For example, if we want to have a double quotation mark (`"`) within some string literal we can't have it directly, instead first we need to have a backslash (`\`) precede it. Also, there many **escape sequences** like `\n`, `\t`, etc. which are predefined by the language.

But that is not all there is to them, we can have **escape sequences** of **octal** and **hexadecimal** digits as well. Below is a list of two such obscure sequences:
- `\` followed by _one_, _two_ or _three_ **octal** digits
- `\x` followed by _one_ or more **hexadecimal** digits

The value that follows `\` and `\x` represents the numerical value of the character. To keep it simple, let's assume the language uses {{<a_blank title="ASCII" url="https://en.wikipedia.org/wiki/ASCII">}} character encoding. In simple terms, it means every character that is used in the language is associated with a predefined numercial value as per the **ASCII specification**. The second and third `cout` statements use nothing but those values in **octal** and **hexadecimal** format respectively, to represent the corresponding characters.

> - If there are more than three octal digits after `\`, then only the first three are considered, the remaining are considered as simple characters in a string.
> - The hexadecimal digits are not case sensitive, `\x6C` is same as `\x6c`.

The table below summarizes all the characters in `"Hello, World!\n"`, but it can be generalized to any string.

{{< table class="table table-sm table-borderless table-hover" >}}
| Character | ASCII Value | Octal | Hexadecimal |
| :-----: | :-: | :----: | :----: |
|   `H`   |  72 | `\110` | `\x48` |
|   `e`   | 101 | `\145` | `\x65` |
|   `l`   | 108 | `\154` | `\x6C` |
|   `l`   | 108 | `\154` | `\x6C` |
|   `o`   | 111 | `\157` | `\x6F` |
|   `,`   |  44 |  `\54` | `\x2C` |
| `SPACE` |  32 |  `\40` | `\x20` |
|   `W`   |  87 | `\127` | `\x57` |
|   `o`   | 111 | `\157` | `\x6F` |
|   `r`   | 114 | `\162` | `\x72` |
|   `l`   | 108 | `\154` | `\x6C` |
|   `d`   | 100 | `\144` | `\x64` |
|   `!`   |  33 |  `\41` | `\x21` |
|  `\n`   |  10 |  `\12` |  `\xA` |
{{</ table >}}

I know life was simple only with the first `cout` statement; I ruined it for good, didn't I?
