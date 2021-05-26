---
layout:     post
title:      Git flow alternatives - a visual overview of branching workflows
date:       2020-10-08 08:13:00
summary:    Git flow alternatives 
categories: programming
---

Throughout this article, I will stick to [github's convention](https://github.com/github/renaming) of calling the base branch `main`.

Let's start with the one most people have heard of before. 

# Git Flow

For quite some time, this was the only branching model I even knew the name of.
I thought of git flow as the way 'professional' software development is done.

Git flow was first introduced by Vincent Driessen in his article [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) from 2010. 

In git flow, feature branches do not directly merge off of `main`.
Instead, development happens on feature branches that come from and go back into the `develop` branch.
Releases are created on `release` branches that come from `develop` and merge into `main`.

Additionally, git flow describes hot-fix branches that come from `main`. 
These hot-fixes get picked into `main` and `develop`.

See the image below to better understand how everything works together.

TODO Image git flow

Git flow is often criticized for being overly convoluted and thwarting Continuous Delivery. 
See for example [here](https://www.endoflineblog.com/gitflow-considered-harmful) and [here](https://about.gitlab.com/blog/2020/03/05/what-is-gitlab-flow/).
Even its originator acknowledges this. 
In a note to his [initial blog post](https://nvie.com/posts/a-successful-git-branching-model/) he says:

> If your team is doing continuous delivery of software, I would suggest to adopt a much simpler workflow (like GitHub flow) instead of trying to shoehorn git-flow into your team. 
> 
> If, however, you are building software that is explicitly versioned, or if you need to support multiple versions of your software in the wild, then git-flow may still be as good of a fit to your team as it has been to people in the last 10 years. In that case, please read on


# Github Flow

[](http://scottchacon.com/2011/08/31/github-flow.html)


# Gitlab Flow
[Gitlab flow](https://about.gitlab.com/blog/2020/03/05/what-is-gitlab-flow/)

[Explanation](https://docs.gitlab.com/ee/topics/gitlab_flow.html)


# One flow
[](https://www.endoflineblog.com/gitflow-considered-harmful)

# Release flow
[](https://docs.microsoft.com/en-us/azure/devops/learn/devops-at-microsoft/release-flow)

TODO Delete
# Sources 
[4 branching workflows for git](https://medium.com/@patrickporto/4-branching-workflows-for-git-30d0aaee7bf)
