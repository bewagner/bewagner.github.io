+++
date = "2021-06-01"
title = "The State of DevOps"
description = "Analyzing developer sentiment towards DevOps based on the Stack Overflow 2020 Developer Survey"
[taxonomies]
tags = ["devops"]
[extra]
image = "people_in_front_of_pc.jpg"
+++

This post is about using data to understand how the software engineering community sees DevOps.

We analyze these questions:

- Do developers value DevOps only once they have it?
- How does having DevOps impact job satisfaction?
- How is sentiment distributed across company sizes?

But first, let's review what DevOps is.

## What is DevOps?

[Wikipedia](https://en.wikipedia.org/wiki/DevOps) defines it like this:

> DevOps is a set of practices that combines software development (Dev) and IT operations (Ops). It aims to shorten the systems development life cycle and provide continuous delivery with high software quality.

So DevOps focuses on:
- shortening development life cycles
- enabling continuous delivery with high quality

These goals matter to nearly every engineering team.

Some common DevOps pillars are:

#### Continuous Deployment

Continuous deployment means new code changes are deployed continuously through automated pipelines.
That gives teams fast feedback about system health.

#### Continuous Integration

With CI, code is analyzed and tested immediately when committed.
This helps agile teams detect and fix issues early.

#### Automated Dashboards

DevOps increases automation and observability.
Teams can build dashboards for key metrics that support technical and business decisions.

Organizations benefit because DevOps can reduce cycle times, accelerate innovation, and improve consistency in complex systems.

## The Stack Overflow 2020 Developer Survey

Theory is useful, but we also want to see whether developers recognize this value.
For that, we use data from the [Stack Overflow 2020 Developer Survey](https://insights.stackoverflow.com/survey).

In 2020, nearly 65,000 people participated.
The survey included DevOps-related questions such as:
- whether organizations have dedicated DevOps personnel
- how important DevOps is for scaling software development

This survey is one of the broadest snapshots of developer sentiment, so it's a good basis for this analysis.

## Do people value DevOps only once they have it?

My impression is that working with solid DevOps processes often changes opinions.
Before experiencing it, some developers see DevOps as overhead.
Afterward, many appreciate how much friction it removes.

The survey data reflects this.
Comparing companies without dedicated DevOps personnel to those with it:
- neutral responses decrease substantially
- responses shift toward “Extremely important”

{{ image(src="plot1.png", alt="How much developers value DevOps when they have it vs. when they don't have it", relative_width=60) }}

I could not control for every confounder (for example prior exposure to DevOps in earlier jobs), but the overall signal is clear: having DevOps correlates with stronger perceived importance.

That leads to the next question.

## How does having DevOps impact job satisfaction?

Here, the signal is less decisive.
There are fewer “Slightly dissatisfied” responses, and “Very satisfied” increases.

{{ image(src="plot2.png", alt="Developer job satisfaction when the company has DevOps vs. when it doesn't", relative_width=60) }}

This may indicate a positive effect from DevOps presence.
It may also reflect other factors like compensation or company context.

## How does sentiment change with company size?

The next chart shows the share of developers rating DevOps as “Extremely important” or “Somewhat important” by company size.

{{ image(src="plot3.png", alt="Percentage of developers that see DevOps as important by company size", relative_width=45) }}

Most developers across company sizes see DevOps as important.
Companies with fewer than ten employees show lower importance ratings, which makes sense because DevOps process gains often scale more in larger organizations.

Still, overall approval is high.
That suggests strong community alignment on DevOps value in modern software development.

## Conclusion

This analysis provides a useful snapshot of DevOps sentiment from the Stack Overflow 2020 survey.
One of the strongest patterns is that having dedicated DevOps support appears to reinforce how important developers perceive DevOps to be.

I was also surprised by how consistently high the importance ratings are for scaled software development.

If you want the analysis code, it is available on [GitHub](https://github.com/bewagner/stack_overflow_survey_devops).
