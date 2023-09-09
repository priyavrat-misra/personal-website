---
title: "Generating Mazes from Scratch"
date: 2023-01-23T21:46:36+05:30
description: ""
tags: ["c++", "programming", "sfml", "game"]
draft: true
---
> _Oftentimes when we have lots of free time, we can't help but think about our forgotten goals. This article is about achieving one such goal I had as a kid i.e., to make my own game._

One day while browsing the Internet, I stumbled across something interesting, a maze generation algorithm. Never before it occurred to me that there are complex algorithms at play for something as simple as children's puzzles. In no time, I was fixated on the idea of seeing it in action.

The experiment began with finding tools to visualize the maze generation process. After doing some digging around, I came across {{<a_blank url="https://www.sfml-dev.org" title="Simple and Fast Multimedia Library (SFML)">}}. I decided to go for it entirely because to it's catchy name, hoping it would be both simple and fast, and to my surprise it was!
> You may use any other library and/or programming language of your choice to follow along. Or if you like exploring new things ~~like me~~, grab your copy of {{<a_blank url="https://www.sfml-dev.org/download.php" title="SFML">}} and start hacking!

### Dry running the Algorithm
> This section is entirely optional.

There are a plethora of algorithms for Maze Generation but in this article I will be using the simplest one of them all i.e., **Randomized Depth First Search** (or oftentimes just called **Recursive Backtracker**).

!["The Algorithm"](/images/mazic.gif)

Before we begin, I want you to get a pen/pencil and a piece of paper, then draw dots in an orderly grid like fashion. Start your pen/pencil with a random dot. Here are some ground rules before we begin:
- For every dot, you have atmost 4 options you can navigate to, those are top, bottom, left and right.
- A dot is considered as visited if you have been there before.
- You can go to a neighboring dot by drawing a line, preferably a bold one.
- Upon coming across a dot with all of it's neighbors visited, backtrack your steps until you find a dot with atleast one unvisited neighbor.
- Repeat the process until all dots are visited.

If you look closely, you will see a maze. The lines you have drawn are the walls and the gaps in between are the paths. _Now challenge someone to solve it!_

#### Pseudocode
```plaintext {linenos=false}
draw dots
start with a random dot
while (non of the dots are unvisited) {
    randomly choose a neighbor to be the next one
    if all neighboring dots are visited for the chosen dot
        backtrack steps until a dot with atleast one unvisited neighbor is found
}
```
&nbsp;
### The Implementation
- [Drawing Dots](#drawing-dots)
- [Choosing the right Data Structure](#choosing-the-right-data-structure)
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
#### Drawing Dots
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
The for loops are used to draw dots in the entire window else it would have been a single dot in the top left corner. If everything works, you should see this in a new window:
![dots](/images/dots.png "They don't look like 'dots', do they? 'cell' is a more accurate term.")
#### Choosing the right Data Structure
Now that the field has been laid, all that remains is to draw the maze. But first we need some data structure to hold information about the maze. Information like whether two cells are neighbors, whether there is a wall separating them and if they are neighbors then in which direction one is present to the next and so on.

The "graph" data structure seems like a good candidate, the cells can be vertices and if two cells are neighbors we can put an edge between them. But is it the right data structure for our use case? Let's see some of it's disadvantages.

Consider the generated image above. It has around 576 cells, which means we need 576 vertices for this specific maze if we represent it as a graph. Let's say the vertices are implemented as structure objects with five integer fields (4 bytes each) to store the information mentioned earlier. So it will consume about 576 * 5 * 4 = 11520 bytes = 11.25 KiloBytes. 
#### Visiting Neighbors
