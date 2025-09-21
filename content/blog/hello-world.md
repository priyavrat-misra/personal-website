---
title: "Overengineering \"Hello, World!\""
date: 2022-06-16T12:30:21+05:30
description: "Octal and Hexadecimal escape sequences in C++."
tags: ["c++", "programming"]
---

> **A word of warning:** This article is not for the faint of heart—or for those who believe “Hello, World!” should ever be simple.

You might be wondering, “Why start with ‘Hello, World!’?” Well, as this is my very first blog post, I wanted to pay homage to the time-honored tradition of beginning every programming journey with this iconic phrase. “Hello, World!” is simple, universal, and instantly recognizable—making it the perfect canvas for a little creative overengineering. If you thought printing a string was straightforward, prepare to have your expectations delightfully complicated.

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

All three `cout` statements will print the same thing—that is, `Hello, World!` (with a newline for good measure).

Now, let’s talk about the “how.” In a nutshell, it’s all thanks to **escape sequences**. These are special codes that let you represent characters that would otherwise be tricky (or downright impossible) to include directly in a string. For example, if you want to sneak a double quotation mark (`"`) inside a string literal, you can’t just plop it in there—you need to precede it with a backslash (`\`). There are also classic escape sequences like `\n` for a newline or `\t` for a tab, all predefined by the language.

But wait—there’s more! Escape sequences aren’t limited to just the usual suspects. You can also use **octal** and **hexadecimal** escape sequences to represent characters by their numeric values. Below are the “obscure” forms:
- `\` followed by _one_, _two_ or _three_ **octal** digits
- `\x` followed by _one_ or more **hexadecimal** digits

The numbers following `\` and `\x` represent the character’s value. For simplicity, let’s assume we’re using {{<a_blank title="ASCII character encoding" url="https://en.wikipedia.org/wiki/ASCII">}}. In plain English, every character in the language is mapped to a predefined numeric value, as per the **ASCII specification**. The second and third `cout` statements above use these values in octal and hexadecimal format, respectively, to conjure up the same familiar message.

> A few notes (so you don’t lose your sanity while experimenting):
> - If there are more than three octal digits after `\`, only the first three are interpreted as part of the escape sequence; the rest are treated as regular characters.
> - Hexadecimal digits are not case-sensitive, `\x6C` is same as `\x6c`.

The table below breaks down each character in `"Hello, World!\n"`—but you can generalize this approach to any string, should you wish to thoroughly confuse your future self (or your colleagues).

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

Hope you enjoyed this deep dive into the unnecessarily complex world of escape sequences. Remember: just because you *can* overengineer “Hello, World!” doesn’t mean you *should*—but it sure is fun.