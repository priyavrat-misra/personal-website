---
title: "Generating Mazes from Scratch"
date: 2023-01-23T21:46:36+05:30
lastmod: 2024-06-27T17:36:00+05:30
description: ""
tags: ["c++", "programming", "sfml", "game", "life"]
draft: true
---
> _Where walls entwine and shadows play, our journey’s map is written day by day; as every step reveals the maze within, we find our way out – or in._  
> -- Llama 3

## The Motivation
One fine day, I stumbled across something interesting: a maze generation algorithm. Never before has it occurred to me that complex algorithms are at work for something as simple as children’s puzzles. In no time, I became fixated on seeing it in action.

The experiment began with finding tools to visualize the maze generation process. After doing some digging around, I came across the {{<a_blank url="https://www.sfml-dev.org" title="Simple and Fast Multimedia Library (SFML)">}}. I decided to go for it entirely because of its catchy name, hoping it would be both simple and fast, and to my surprise, it was!

> You may follow along using any other graphics library and programming language of your choice. Or if you like exploring new things ~~like me~~, grab a copy of {{<a_blank url="https://www.sfml-dev.org/download.php" title="SFML">}} and start hacking!

## The Algorithm
Since you’ve made it this far, I will assume that you have solved mazes of some form or another in the past. To refresh your childhood memory, here’s how it goes.

A typical maze has a start and an endpoint. When solving one, you begin by tracing a path from the starting point, then going with the flow until you hit a dead end. At that point, you backtrack and explore alternative routes until you find a viable opening. Eventually, you’ll reach the end, and immediately, your brain will release dopamine, giving you a sense of accomplishment. But let’s not dwell on the thrill of maze-solving; instead, I’ll backtrack my lines and look for a viable opening to continue.

As you lift your pencil, you might notice that you’ve left behind an artistic trail – a testament to the twists and turns you took along the way. You will likely fall somewhere on a scale between “luckiest” (optimal path, no backtracking) and “unluckiest” (covering every inch of the maze). If you’re often the latter, here’s a quote I made up to lift your spirits:

> _The unluckiest ones are the ones who learn the most._

Sit with that for a minute. Okay, enough about life, let's backtrack.

There’s a reason why I brought up the worst-case path (or _“spanning path”_ in _Graph Theory_ terms). When you think about it, there will be no blank space in the maze in such a scenario. Moreover,
1. The entire maze area will become the combination of walls and the worst-case path, with one resulting in the complement of another and vice versa; i.e., having one will give enough information to generate another.
2. There’s always at least one path from one maze cell to another.
3. The optimal paths are subsets of it.

From these corollaries, we can conclude that,

> Generating a **valid** worst-case path will naturally create the maze’s walls. Since each cell is connected by at least one path, there is always a route between the start and end cells, leading to a valid maze.

!["The Algorithm"](/images/mazic.gif "An animation showing various steps in the algorithm.")

Now, to generate a “valid” worst-case path, we have to reverse-engineer how we solve a maze. The idea is simple, start at any cell (not necessarily the starting), then randomly venture into one of its unexplored neighboring cells. From there, repeat this depth-first process by randomly selecting another neighboring cell, and so on. Eventually, you’ll stumble upon a cell with no remaining neighbors to explore - a dead end, in maze terms. But don’t give up! You must backtrack your steps until you find a new path to pursue, like in real life. This iterative process continues until every cell has been visited, revealing the entire maze in all its glorious complexity.

### TL;DR
```plaintext {linenos=false}
draw a grid of cells
start with a random cell
while there are unvisited cells {
    visit an unvisited neighboring cell at random
    if all of it's neighboring cells are visited
        backtrack until a cell with at least an unvisited neighbor is found
}
```
&nbsp;
## The Implementation - WORK IN PROGRESS
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
### Drawing Cells
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
### Representing the Maze in Memory
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
### Visiting Neighbors
