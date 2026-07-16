+++
title = "Trailsolver"
description = "Plan your multi-day trail with Z3 — minimise the deviation from your daily distance target across all possible overnight stop combinations."
template = "page.html"
[extra]
hiking_planner = true
+++

Plan a multi-day hike, bikepacking trip, or any trail with fixed overnight stops — huts, campsites, bivouacs, or refuges. Enter your stops and daily target, and find the optimal combinations.

Instead of typing in each stop by hand, you can also upload a JSON file mapping stop names to their cumulative distance from the trailhead (in km), e.g. `{ "Trailhead": 0, "First Hut": 12, "Second Hut": 27 }`. See [example-trail.json](https://github.com/bewagner/bewagner.github.io/blob/master/content/apps/trailsolver/example-trail.json) in the GitHub repo for a full example you can download and adapt.

{{ trailsolver() }}
