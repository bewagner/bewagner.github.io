+++
date = "2026-04-12"
title = "Hiking Planner"
description = "Plan your multi-day hike interactively with Z3 — minimise the deviation from your daily distance target across all possible hut combinations."
[taxonomies]
tags = ["z3", "hiking", "tools"]
[extra]
hiking_planner = true
+++

Planning a multi-day hike along a trail with a fixed set of mountain huts is a classic scheduling problem:
given the distances between huts and a target daily distance, which huts should you stay at on each night?

This planner solves it exactly using the [Z3 SMT solver](https://github.com/Z3Prover/z3) compiled to WebAssembly — the same logic as the Python script described below, running entirely in your browser.

## How it works

Each day's stopping hut is modelled as an integer decision variable.
Z3's `Optimize` minimises the sum of absolute deviations from the daily target across every day, subject to constraints that force stops to be strictly ordered and to end at the final hut.
Multiple plans are produced by blocking each found assignment and re-solving.

## Planner

Enter your huts below as `Name, km from trailhead` — one per line.
The first entry must be the trailhead at km 0.

{{ hiking_planner() }}
