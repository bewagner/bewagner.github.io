---
layout:     post
title:      Better pull requests
date:       2020-04-13 08:13:00
summary:    TODO
categories: programming
---

#(Maybe, Maybe not) Recap: What is a PR

# Why?
There are several reasons why you should strive for better pull requests. 

### TODO introduce PR abbreviation

## You are forced to think about your changes
While creating the pull request, you will have time to reconsider your changes. 
If you don't spend time on the 

## Faster and better code reviews
If you spend some time on writing a good pull request, it will make the whole review process much faster.
Instead of thinking about what you changed and why, the reviewers can directly start reviewing.

Also, reviewers will be more gracious with your errors if you seek to make their life easier.

## Documentation for future developers (including future you)
Clearly documented changes can be an immense help when you search for bugs. 
PR's can be a part of your documentation.  
Write them well. 
When the bugs appear, your PR will be there to document why you changed the code. 


# Review it yourself
The first thing you do after creating the pull request is you should review it yourself.
You might be too entangled in your code to find logical errors. 
But since you know where you worked diligent and where you were sloppy, you're most qualified to find careless mistakes. 

And it's also a sign of respect towards the reviewer. 
They will be happy if they can skip cleaning up your code. 
And they will have more time and brain power left to review the logic of your code.

## Go for the low-hanging fruit 

Here are some common error types you can find by reviewing pull requests yourself.

### Unintended file changes 
Often I find that I changed files I didn't want to touch. 
A classic example are configuration files that played with and then forgot to reset to the initial values. 
Or maybe you incidentally added your IDE's configuration file. 

Use this command to **reset individual files to a previous commit:**

{% highlight shell %}
$ git checkout <commit_hash> -- file/to/restore/1 file/to/restore/2 ...
{% endhighlight %}


### Mistakes you overlooked

Finding errors in your code is not limited to your reviewers. 
Even though your reviewers will look at your code with a fresh of eyes, there are classes of errors you easily find yourself. 

#### Commented code


#### Formatting and empty lines
If you and your colleagues are not using a common formatting style, you will make unintended changes to the code formatting. 
The changes will end up in your pull request. 
The same goes for empty lines you added/deleted without noticing it. 

These are not the changes you want your reviewers to look at. 
If you committed a big amount of formatting changes, figuring out what to review will become harder for your reviewers. 

But what if you made code changes and changes to the formatting. How can you discard the formatting changes? 
Use the following command to decide individually for each change whether it should be part of the commit. 

{% highlight shell %}
$ git add --patch <files_you_want_to_add>
{% endhighlight %}

#### Code smells

<figure class="image">
  <img src="https://static.hunde.de/upload/1391082995_american-eskimo-dog-wikimedia-commons-450x315.jpg" >
  <figcaption>Das ist ein Hund</figcaption>
</figure>





# Make it small
## Why? 
### people are busy: Bild
### Review quality has negative correlation to number of files changed 
### People will say "Looks good to me"

# How can you split your PR up

# git add -p/--patch

# Write a good summary 

# Focus


What makes a good summary?
- Write what you did
- Write why you did it
- Tell the reviewer what you want
  - Is there anything to review?
  - Where can they be more/less strict

# Add comments to your own PR



# Notifying people that are no reviewers
Sometimes there are changes you want to notify your team members about, without adding them as a reviewer. 
A typical example for this is when the name of a component in your code changes. 
You want everybody on the team to know. 
But it's enough if they have a quick look at the changes.
They don't need to be a reviewer. 

In most project management tools you receive an e-mail every time some mentions you in a PR. 
Type an '@' followed by your colleagues name or shorthand. 
They will be notified an call look at the changes you made.

# Use images/videos  

# Include links?
