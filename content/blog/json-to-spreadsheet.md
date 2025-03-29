---
title: "An attempt at mapping JSON to Spreadsheet"
date: 2025-02-25T09:45:53+05:30
description: ""
tags: ["java", "apache-poi", "programming"]
draft: true
---
### How it began
The year was 2023. I had just landed my first job at a massive conglomerate. You know, one of those companies with more departments than people at your local coffee shop. One fine sprint grooming meeting, I was handed a story: _add a feature that lets users export some data as a spreadsheet_. I squinted at the task, thought, "How hard can that be?" With the confidence of someone who’s never actually done it, I nonchalantly estimated it at two story points (and needless to say, it involved exposing an API and integrating it in the front-end). Surely, that would be enough... right?

### The "simple" task that wasn't
As any good software engineer would, I turned to Google in search of a Java library to get the job done. Surely, there had to be something out there, right? The first search result was Apache POI. I dove into the documentation and stumbled upon a guide titled ["Busy Developers' Guide to HSSF and XSSF Features"](https://poi.apache.org/components/spreadsheet/quick-guide.html). It looked _simple_ enough—basically just mapping values in 2D arrays. "This is a breeze," I thought, "Two story points should cover it." I even gave myself a mental high-five.

But then came the rude awakening. I had no idea what kind of data I was actually dealing with. So, I sent a few emails to the neighboring team who were working on the contract, and after what felt like a dozen follow-ups, they finally sent me a sample JSON. And of course, it was _nested…_ and it had _lists_. Just like that, my two story points were looking a little too optimistic. In fact, it was starting to seem like I might need a whole new sprint to handle this properly.

### The nested nightmare
Why, you might ask? Well, JSON is hierarchical, and there’s no real limit to how deep those levels can go. One property has some sub-properties, which have their own sub-properties, and so on, creating a multidimensional web of data. But in a spreadsheet, we’re working with a neat, orderly 2D grid—nothing too fancy, just rows and columns.

Naturally, I turned to my friendly local LLM, asked for a sample JSON, and started exploring various ways to tame this wild data.
```json
{
  "store": {
    "name": "Tech Store",
    "location": "Downtown",
    "products": [
      {
        "id": 1,
        "name": "Laptop",
        "price": 999.99,
        "specs": {
          "processor": "Intel i7",
          "ram": "16GB",
          "storage": "512GB SSD"
        }
      },
      {
        "id": 2,
        "name": "Smartphone",
        "price": 799.99,
        "specs": {
          "processor": "Snapdragon 888",
          "ram": "8GB",
          "storage": "128GB"
        }
      }
    ],
    "employees": [
      {
        "id": 1,
        "name": "Alice",
        "role": "Manager"
      },
      {
        "id": 2,
        "name": "Bob",
        "role": "Sales Associate"
      }
    ],
    "working_hours": [
      "9:00 AM - 5:00 PM",
      "9:00 AM - 6:00 PM",
      "10:00 AM - 4:00 PM"
    ]
  }
}
```

#### The relational database approach
I thought I'd get clever and tackle this like a database. My plan: break down the JSON into a relational format. I started with the deepest level and created a table for it, giving it an ID (a primary key, obviously). Then I worked my way up, creating tables for each parent level, linking them with foreign keys. Easy enough, right?

Well, it was easy—until I hit the SQL join part. What should’ve been a nice, clean 2D output turned into a nightmare of duplicates. It looked like one of those classic "Introduction to Database Normalization" examples, but in real life, which is never a good sign.

#### The merged cell approach

#### The flattened JSON approach

### The Good, The Bad, and The Ugly
At this point I had three versions of spreadsheet.

### The formatting fiasco
