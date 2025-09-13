---
title: "Counting at Scale"
date: 2025-07-03T20:48:00+05:30
description: "A mathematical exploration of efficiently counting at scale, where traditional methods fall short."
tags: ["databases", "system-design", "mathematics"]
params:
  math: true
---
### Motivation

Last weekend, I decided to delve deeper into the world of databases and stumbled upon the fantastic {{<a_blank title="CMU 15-445/645" url="https://15445.courses.cs.cmu.edu/">}} course. After the introduction lecture, I jumped straight into the assignments. The first one, aptly named {{<a_blank title="C++ Primer" url="https://15445.courses.cs.cmu.edu/fall2024/project0/">}}, is a straightforward programming task designed to assess your grasp of basic C++ features.

### The Problem

The problem? Track the number of **unique** users accessing a website in a single day. If this were a LeetCode problem, it would be a breeze—just toss all the users into an `unordered_set` and return its size. Easy, right? But, as with most things in life, real-world problems are rarely so simple—or so memory-friendly.

Let’s break down the “LeetCode way.” Imagine we’re working at Facebook, say about one billion unique users log in daily, and each user ID is around 8 bytes. Using an `unordered_set`, that’s 8 billion bytes of memory—about 7.7 GB—just to count users! All we really want is a single number. It’s like renting an entire stadium just to host a two-person meeting.

### Data Streams vs. Accumulated Data
But there’s another subtlety here: in real-world systems, we’re often dealing with a data stream, not a static, accumulated dataset. Users are constantly logging in, and we want to process each event as it happens—potentially across distributed servers—without storing the entire history of who has logged in so far.

The `unordered_set` solution works if we have all the data in memory and can afford to keep it there, but that’s rarely feasible at scale. In practice, we don’t want to keep every user ID we’ve ever seen—especially when the list can be massive and ever-growing. Instead, we need a way to estimate the number of unique users “on the fly,” using minimal memory, and without revisiting or accumulating all previous data.

### Practical Approaches and their Pitfalls

Let’s get practical. Suppose there’s a “last seen” metadata field associated with each user. We could increment a counter whenever “last seen” is updated from a timestamp that isn’t from the current day. Sounds simple, right? But in reality, every time a user opens the app, we’re hitting the database for a lookup—hardly efficient.

You might argue, “But we’re fetching user data anyway to show in the chat window, so why not cache and reuse it?” That’s true—*if* the user visits the chat window. If not, the lookup is only for the counter, which feels wasteful. Plus, we’re assuming the existence of a “last seen” field, which isn’t always available.

Now, consider a different question: “How many unique users have liked posts in the last month?” Here, we’re dealing with a different set of actions and data. Often, we have no choice but to perform full table scans, which can put serious strain on the database—much like asking your laptop to run Crysis on integrated graphics.

### Enter HyperLogLog: A Probabilistic Solution

The problem statement then brings us to HyperLogLog—a probabilistic algorithm designed to estimate the number of unique elements (the “cardinality”) in a data stream without explicitly storing every item. The key idea? The more unique elements we see, the more likely we are to encounter a hash with many contiguous zeroes.

> According to {{<a_blank title="HyperLogLog: The analysis of a near-optimal cardinality estimation algorithm" url="https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf">}}, the HyperLogLog algorithm is able to estimate cardinalities of \(>10^{9}\) with a typical accuracy (standard error) of \(2\%\), using \(1.5 kB\) of memory.

#### How HyperLogLog works?

HyperLogLog uses a hash function—ideally, one that produces uniformly distributed values. We take the user ID (or any suitable identifier), hash it to a numerical value, and use its binary representation. Some implementations consider the maximum number of trailing zeroes, others look at the maximum leftmost position of \(1\) (i.e., the maximum number of leading zeroes plus one). For our discussion, we’ll stick with the latter, as in the problem statement.

Assuming no hash collisions, our problem reduces to finding the number of unique binary strings. If you remember your high school math, for a random binary string, the probability of getting \(k\) leading zeroes followed by a one is \(1 / 2^{k+1}\).

![Probability of getting a leftmost one illustrated](/images/hyperloglog/leftmostOneProbability.svg)

Alternatively, think of the string as a series of coin tosses: zero means heads, one means tails. If, across multiple individual runs, the longest run of heads we encountered is \(l\), then its probability is \(1 / 2^{l+1}\). In other words, we can estimate that, on average, we’ve tried at least \(2^{l+1}\) times.

To put it simply: if we see a maximum run of 2 heads, \(HHT\), we probably tossed the coin at least \(2^{2+1} = 8\) times, \(\{HHH, HHT, HTH, HTT,\allowbreak THH, THT, TTH, TTT\}\). The probability ends up being \(1 / 8\).

Note that, \(HHH\) isn't valid here because we considered the maximum leading heads to be 2, so technically it should be one less, but to keep things simple, we can round it off.

Try to solve for a maximum run of 10 heads—notice how quickly the probability drops!

The chance of seeing a hash with many leading zeroes is very low, and the more unique elements we see, the higher the chance we’ll encounter such a hash. However, it’s still possible—thanks to uniform hashing—to get unlucky and see a binary string with many leading zeroes after just a few tries. These are outliers, and HyperLogLog has a clever way of handling them.

#### Bucketing and Mergeability

To manage outliers, HyperLogLog distributes the hash values into different buckets based on the initial \(b\) bits of the hash. This gives us a total of \(2^b\) buckets, each tracking its own maximum. Even though we’re distributing values, the maximum among them remains the same, so our problem is *mergeable*—we don’t have to worry about double-counting.

![Bucketing in HyperLogLog illustrated](/images/hyperloglog/hllBuckets.svg)

This property is incredibly useful for questions like, “How many unique users have liked posts in the last month?” We can easily combine the buckets for each day and calculate the result. To do this, we persist each day’s serialized HyperLogLog structure (typically just a few kilobytes—no big deal). The mergeability of HyperLogLog is also a boon in distributed systems: each server can maintain its own buckets, which can later be aggregated.

#### Why not just use the mean?

So, what if we take the average of all the maximums across the buckets? Does it solve the outlier problem? Unfortunately, no. The average is still affected by outliers. Instead, HyperLogLog uses the *harmonic mean*, which is less sensitive to large outliers.

Let \(b\) be the number of bits chosen to identify a bucket, giving us \(m = 2^b\) buckets. Let \(p_i\) be the maximum leftmost position of \(1\) seen so far for bucket \(i\). The cardinality estimate is calculated as:

\[0.79402 * m * \frac{m}{\sum_{i=0}^{m-1} 2^{-p_i}}\]

Notice that outliers appear in the denominator as \(p_i\), contributing only slightly to the cardinality. Also, the more buckets we have, the more outliers we can handle, and the more accurate the cardinality estimate becomes (although this does require more memory).

### Real-World Impact

The efficiency and scalability of HyperLogLog have cemented its place as an industry standard for large-scale unique counting. For instance, Redis offers built-in HyperLogLog support, enabling developers to track unique website visitors or event occurrences with just a few kilobytes of memory. Likewise, Google Analytics relies on similar probabilistic algorithms to deliver fast, accurate unique user counts across billions of events, powering real-time analytics on a global scale. Beyond these high-profile examples, HyperLogLog is widely used in streaming analytics dashboards, traffic heatmaps, and any scenario where massive data volumes demand both accuracy and minimal memory usage.

### Conclusion

I hope you found this exploration as engaging to read as I did to put together! Thanks for joining me on this deep dive.

#### Further Reading

- {{<a_blank title="Original HyperLogLog Paper (PDF)" url="https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf">}}
- {{<a_blank title="A blog on Meta's implementation of HLL" url="https://engineering.fb.com/2018/12/13/data-infrastructure/hyperloglog/">}}
- {{<a_blank title="HyperLogLog in Redis" url="https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/">}}
- {{<a_blank title="BigQuery’s Approximate Count Distinct" url="https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions#approx_count_distinct">}}
