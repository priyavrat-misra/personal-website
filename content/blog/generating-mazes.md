---
title: "Generating Mazes from Scratch"
date: 2023-01-23T21:46:36+05:30
description: ""
tags: ["c++", "programming", "sfml", "game"]
draft: true
---
Oftentimes when we are all alone, we can't help but think about our forgotten goals. This article is about achieving one such goal I had as a kid i.e., to make a computer game.

One day while browsing the Internet, I stumbled across something interesting, a maze generation algorithm. In no time, I was fixated on the idea of seeing it in action. Never before it occurred to me that there are complex algorithms at work for something as simple as children's puzzles.

The experiment began with finding tools to visualize the maze generation processes. Eventually, I came across {{<a_blank url="https://www.sfml-dev.org" title="Simple and Fast Multimedia Library (SFML)">}}. I decided to go for it entirely due to it's name, hoping it would be both simple and fast, and it was! However, it is possible to use any other library and/or programming language of your choice to follow along. Or you can just give SFML a shot as well.

You can install SFML for your operating system by following the respective guide from {{<a_blank url="https://www.sfml-dev.org/tutorials/2.5/#getting-started" title="here">}}.
### The Algorithm
There are a plethora of maze generation algorithms out there but this article will be about the simplest of them all i.e., **Randomized Depth First Search** (or oftentimes just called **Recursive Backtracker**).

!["The Algorithm"](/images/mazic.gif#floatright)
Before we begin, I want you to get a pen/pencil and a piece of paper, then draw dots in an orderly grid like fashion. Start your pen/pencil with a random dot. For every dot, you have atmost 4 options i.e., the unvisited neighbors to choose from. A dot is considered as visited if you have been there before. Go to one of the neighboring dots by drawing a line. If you come across a dot with all of it's neighbors visited, backtrack your steps until you find a dot with atleast one unvisited neighbor. Repeat the process until all dots are visited. That's it, you have your algorithmically generated maze from scratch. Thanks for reading, kthxbye.
```plaintext {linenos=false}
draw dots
start with a random dot
while (every dots are not visited) {
    randomly choose a neighbor to be the next dot
    if all neighbor are visited
        backtrack steps until a dot with atleast an unvisited neighbor
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
    draw in the window buffer
    display whatever that is drawn
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
![dots](/images/dots.png "They don't look like 'dots', are they? From now on I'll use the word 'cells'.")
#### Choosing the right Data Structure
Now that the field has been laid, all that remains is to draw the maze. But first we need some data structure to hold information about the maze. Information like whether two cells are neighbors, whether there is a wall separating them and if they are neighbors then in which direction one is present to the next and so on.

Maybe we can use a "graph" to represent the maze? Let's see, the cells can be nodes and if two cells are neighbors we can put an edge between them.
#### Visiting Neighbors
