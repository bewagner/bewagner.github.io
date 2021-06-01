---
layout:     post
title:      The state of DevOps
date:       2021-06-01 08:13:00
summary:    Analyzing developer sentiment towards DevOps based on the Stack Overflow 2020 Developer Survey 
categories: programming
---

This post is about using data to find out how the software engineering community sees DevOps. 

We will analyze the following questions:

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
Continuous deployment describes the process of deploying new features continuously.
An automated pipeline deploys new code changes.
In this way, the engineering team is always informed about the health of the overall system.


#### Continuous Integration
With continuous integration, code is immediately analyzed and tested whenever it is checked into the version control system. 
That makes continuous integration an important tool for agile teams because they can fix problems right when they appear.

#### Automated Dashboards
DevOps brings automation and observability to the software development process.
This automation enables teams to create automated dashboards for their key metrics of interest.
These key metrics can then serve as the basis for important business decisions.



Organizations benefit from having DevOps because it accelerates innovation by reducing cycle times between development and deployment. 
DevOps is also an important tool for scalability.
It introduces a high degree of consistency that allows you to manage and change complex systems.



## The Stack Overflow 2020 Developer Survey
All these benefits sound nice in theory. 
But they're worthless if the community doesn't recognize their value.
Thus, we will look at data from the [Stack Overflow 2020 Developer Survey](https://insights.stackoverflow.com/survey) to see what the community's thoughts on DevOps are. 

Stack Overflow conducts a yearly survey about a wide range of topics connected to programming.
In 2020, nearly 65.000 people participated.
Apart from the broad array of questions the previous years featured, the 2020 survey also included data about DevOps. 
Participants answered whether their organization has dedicated DevOps personnel and how important they think DevOps is for scaling software development.

The yearly Stack Overflow survey gives us the most comprehensive picture of developer sentiment towards new technologies. 
Therefore, we will use it to assess whether DevOps gets the love it deserves.


## Do people only recognize the value of DevOps once they have it?
This is the first question we're going to answer.
My impression is that working in an environment with solid DevOps processes changes people's minds.
Before developers experience the benefits of a good DevOps pipeline, they are often doubtful whether it helps them write better code.
Some might also see it as an extra burden. 

But once they experience how much easier their life can become, a lot of people change their minds. 
People appreciate that good DevOps pipelines can lift a lot of weight from the developer's shoulders. 

This is also what we find in the data for how important survey respondents think DevOps is.
If we compare the answers for companies without dedicated DevOps personnel to those with DevOps personnel, we see a clear difference. 
The percentage of respondents that answered neutral decreases by 13 percent.
Additionally, there is a clear shift towards seeing DevOps as 'Extremely important'. 

![How much developers value DevOps when they have it vs. when they don't have it](/images/2021/05/plot1.png){:class="img-responsive" width="80%" style="padding: 3% 0 3% 0 "}
{: .center}

The data shows that developers learn to appreciate DevOps processes if their company provides them. 
I could not correct for other factors like respondents that knew DevOps from previous companies.
Yet, the general picture is still that having DevOps reinforces its importance for developers.

This leads us to the next question. 
If engineers learn to appreciate the benefits of DevOps when they work with it, does having DevOps also influence their job satisfaction?

## How does having DevOps impact job satisfaction?

Here, the data is less clear.
Fewer respondents answered 'Slightly dissatisfied'. But, the number of developers that feel 'Very satisfied' increased.

![Developer job satisfaction when the company has DevOps vs. when it doesn't](/images/2021/05/plot2.png){:class="img-responsive" width="80%" style="padding: 3% 0 3% 0 "}
{: .center}

This could indicate that having DevOps personnel slightly increases job satisfaction for developers.  
But it might also be due to other factors like company size and compensation.

## How does sentiment towards DevOps change with company size?

The next plot shows us the percentage of developers that said having DevOps is 'Extremely important' or 'Somewhat important' by company size.

![Percentage of developers that see DevOps as important by company size](/images/2021/05/plot3.png){:class="img-responsive" width="80%" style="padding: 3% 0 3% 0 "}
{: .center}

We see that the majority of developers see DevOps as an important tool in a modern software organization. 
Yet, respondents from companies with less than ten employees see it as less important.
This is understandable, as the effectiveness of DevOps processes unfolds better in larger companies. 

Still, the high approval ratings are encouraging. This shows that the community is already united in its conviction of the importance of DevOps.

## Conclusion

That was our analysis of the state of DevOps via the Stack Overflow developer survey.
For me, it was interesting to see that having/not having DevOps leaves a significant impression on DevOps. 
I was also surprised by the high percentages of developers that think DevOps is important for scaled software development.

If you're interested in the code for this analysis, you can check it out on [my Github](https://github.com/bewagner/stack_overflow_survey_devops).



























