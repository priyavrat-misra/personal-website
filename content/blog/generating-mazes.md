---
title: "Generating Mazes from Scratch"
date: 2023-01-23T21:46:36+05:30
lastmod: 2024-01-15T11:30:00+05:30
description: ""
tags: ["c++", "programming", "sfml", "game"]
draft: true
---
> _Oftentimes we can't help but contemplate about our forgotten ambitions. This article is about how I achieved one such ambition I had as a kid._

One day while navigating the _World Wide Web_, I stumbled across something interesting, a maze generation algorithm. Never before it occurred to me that there are complex algorithms at work for something as simple as children's puzzles. In no time, I was fixated on the idea of seeing it in action.

The experiment began with finding tools to visualize the maze generation process. After doing some digging around, I came across {{<a_blank url="https://www.sfml-dev.org" title="Simple and Fast Multimedia Library (SFML)">}}. I decided to go for it entirely because of it's catchy name, hoping it would be both simple and fast, and to my surprise it was!
> You may use any other library and/or programming language of your choice to follow along. Or if you like exploring new things ~~like me~~, grab a copy of {{<a_blank url="https://www.sfml-dev.org/download.php" title="SFML">}} and start hacking!

There are a plethora of algorithms for Maze Generation but in this article we will be exploring the simplest one of them all i.e., **Randomized Depth First Search** (or oftentimes just called **Recursive Backtracker**).

### Dry running the Algorithm on Paper
> This section is entirely optional.

!["The Algorithm"](/images/mazic.gif "An animation showing various steps in the algorithm.")

Before we begin, I want you to get a pencil and a piece of paper, then draw rectangular cells in an orderly grid like fashion. Below are some ground rules to generate your own maze!
- Start your pencil with a random cell.
- From every cell you can navigate to top, bottom, left or right.
- You can go to a neighboring cell by drawing a line.
- A cell is considered visited if you have been there before.
- Upon coming across a cell with all of it's neighbors visited, backtrack your steps until you find a cell with atleast one unvisited neighbor.
- Repeat the process until all cells are visited.

If you look closely, you will see a maze. The lines you have drawn is the path and the gaps in between are the walls. _Now challenge someone to solve it!_

#### Pseudocode
```plaintext {linenos=false}
draw cells in a grid like fashion
start with a random cell
repeat until there is no unvisited cell {
    randomly choose a neighbor
    if all of it's neighboring cells are visited
        backtrack steps until a cell with atleast one unvisited neighbor is found
}
```
&nbsp;
### The Implementation
- [Drawing Cells](#drawing-cells)
- [Representing the Maze in Memory](#representing-the-maze-in-memory)
- [Visiting Neighbors](#visiting-neighbors)

In any game program, there are 5 steps, 1st step runs once and the next 4 steps are looped over (it is usually called a **game loop**).
```plaintext {linenos=false}
create a window
while (window is open) {
    check if there are any events & act accordingly
    clear the window of off any previous artifacts
    draw to the window buffer
    display whatever that was drawn
}
```
> An _event_ can be thought of as an input by the user. Here are some examples:
> - Pressing some key,
> - Moving the mouse,
> - Closing/Resizing the window, etc.
>
> Though its not necessary but if you want to know more about events, I highly recommend reading the {{<a_blank url="https://www.sfml-dev.org/tutorials/2.5/window-events.php" title="SFML Documentation">}}.

Now let's kick off the project by drawing some dots on the screen by using the idea behind the pseudocode.
#### Drawing Cells
Don't get scared of the following code, I know it seems daunting but so does everything at first.
```c++
#include <SFML/Graphics.hpp>

int main() {
    int width = 720, height = 720;  // window's width and height in pixels
    sf::RenderWindow window(sf::VideoMode(width, height), "Mazic");

    // define the dot's properties
    sf::RectangleShape dot(sf::Vector2f(21.f, 21.f));  // 21x21 rectangular dot
    dot.setFillColor(sf::Color(40, 40, 40));  // set color of the dot

    // the game loop
    while (window.isOpen()) {
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed)
                window.close();
        }

        window.clear(sf::Color(64, 62, 65));  // background color of the maze
        for (int i = 0; i < width; i += 30) {
                for (int j = 0; j < height; j += 30) {
                        dot.setPosition(i, j);
                        window.draw(dot);
                }
        }
        window.display();
    }
}
```
The `for` loops are used to draw dots in the entire window else it would have been a single dot in the top left corner. If everything works, you should see this in a new window:
![dots](/images/dots.png "They don't look like 'dots', do they? 'cell' is a more accurate term.")
#### Representing the Maze in Memory
Now that the field has been laid, all that remains is to draw the maze. But first we need some data structure to hold information about the maze. Information like whether two cells are neighbors, whether there is a wall separating them and so on.

The "graph" data structure seems like a good candidate, the cells can be vertices and if two cells are neighbors we can put an edge between them. A traditional object oriented approach to represent it would be to create a `struct` with necessary properties but, is it the most optimized? Let's analyze.
```c++
struct Cell {
    bool isVisited;
    Cell* top;
    Cell* right;
    Cell* down;
    Cell* left;
};
```

Consider the generated image above. It has 576 cells, which means we need 576 vertices for this specific maze. Let's calculate memory consumption of one cell. Now we have 4 pointer variables, depending upon the CPU architecture their sizes will vary, let's consider them as 8 bytes each, which makes it 32 bytes. Now you might be eager to add one more byte for the `bool` but _"knock knock"_, _"who's there?"_, _"`struct` alignment"_.
#### Visiting Neighbors
