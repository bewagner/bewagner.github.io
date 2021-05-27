---
layout:     post
title:      Stackoverflow
date:       2021-05-26 08:13:00
summary:   TODO 
categories: programming
---

This post is about using data to find out how the software engineering community sees DevOps. 

We will answer the following questions:

- Do developers only value DevOps once they have it?
- How does having DevOps impact job satisfaction?
- What is the distribution of sentiment towards DevOps in companies of different sizes?

But first, let's review what DevOps is in the first place.

## What is DevOps?


[Wikipedia](https://en.wikipedia.org/wiki/DevOps) defines it like this: 

> DevOps is a set of practices that combines software development (Dev) and IT operations (Ops). It aims to shorten the systems development life cycle and provide continuous delivery with high software quality.


We see that DevOps is about *shortening the development life cycle* and *providing continuous delivery with high quality*.
These are two features that every team looks for in their code. 
Some of the paradigms that underlie effective DevOps are:

#### Continuous Deployment
Continuous deployment describes the process of deploying new features in a continuous fashion.
An automated pipeline deploys new code changes.
In this way, the engineering team can always be informed about the health of the overall system.


#### Continuous Integration
With continuous integration, code is immediately analyzed and tested whenever it is checked into the version control system. 
That makes continuous integration an important tool for agile teams, because they can fix problems right when they appear.

#### Automated Dashboards
DevOps brings automation and observability to the software development process.
This automation enables teams to create automated dashboards for their key metrics of interest.
These key metrics can then serve as the basis for important business decisions.



Organizations can benefit from having DevOps because it accelerates innovation by reducing cycle times between development and deployment. 
DevOps is also an important tool for scalability.
It introduces a high degree of consistency that allows you to manage and change complex systems more easily.


TODO Make plots line plots with two lines instead


## The Stack Overflow 2020 Developer Survey
All of these benefits sound nice in theory. 
But they're worthless if the community doesn't recognize their value.
Therefore we will look at data from the [Stack Overflow 2020 Developer Survey](https://insights.stackoverflow.com/survey) to see what the communities thoughts on DevOps are. 

Stack overflow conducts a yearly survey about a wide range of topics connected to programming.
In 2020, the survey was taken by nearly 65.000 people.
Apart from the broad array of questions the previous years featured, the 2020 survey also included data regarding DevOps. 
Participants were asked whether their organization has dedicated DevOps personnel and how important they think DevOps is for scaling software development.

The yearly stack overflow survey gives us the most comprehensive picture on developer sentiment towards new technologies. 
Therefore, we will use it to assess whether DevOps gets the love it deserves.


## Do people only recognize the value of DevOps once they have it?
This is the first question we're going to answer.
My personal impression is that working in an environment with solid DevOps processes can really change peoples minds.
Before developers experience the benefits of a good DevOps pipeline, they are often doubtful whether it helps them develop better code.
Some might also see it as an additional burden. 

But once they experience how much easier their life can become, a lot of people change their mind. 
People appreciate that good DevOps pipelines can lift a lot of weight from the developers shoulders. 

This is also what we find in the data if we look at how important survey respondents think DevOps is.
If we compare the answers for companies without dedicated DevOps personnel to those with DevOps personnel, we see a clear difference. 
The percentage of respondents that answered neutral decreases by ten percent.
Additionally, there is an apparent shift towards seeing DevOps as 'Somewhat important' or 'Extremely important'. 

![How much developers value DevOps when they have it vs. when they don't have it](/images/2021/05/recognition.png){:class="img-responsive"}
{: .center}

The data shows that developers learn to appreciate DevOps processes if their company provides them. 
While we could not correct for respondents that knew DevOps from previous companies, the general pictures still is that having DevOps reinforces its importance for developers.

This leads us to the next question. 
If engineers learn to appreciate the benefits of DevOps when they work with it, does having DevOps also influence their job satisfaction?

## How does having DevOps impact job satisfaction?



![Developer job satisfaction when the company has DevOps vs. when it doesn't](/images/2021/05/satisfaction.png){:class="img-responsive"}
{: .center}

## How does sentiment towards DevOps change with company size?

![Percentage of developers that see DevOps as important by company size](/images/2021/05/company_size_vs_importance.png){:class="img-responsive"}
{: .center}

TODO DevOps doesn't equal devops

## Conclusion
TODO 



























