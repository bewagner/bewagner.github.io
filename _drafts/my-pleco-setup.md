---
layout:     post
title:      My Pleco flashcard setup
date:       2020-05-18 08:13:00
summary:    How I use Pleco's flashcard feature to practice Mandarin
categories: mandarin
---
# TODO Überarbeiten
Ever since I started learning Mandarin, I have been using [Pleco](www.pleco.com). 
For most Mandarin learners I've met, it's the most important learning tool. 

Apart from its superb dictionary, I mostly use Pleco for learning flashcards.  
The flashcard feature is very customizable. 
It's very nice that we can shape the app as we need it.
But sometimes I felt like I was getting lost in the abundance of options. 

The way I use the flashcard feature evolved over time. 
Now it is in a state that helps me learn new words more quickly. 

# TODO Mention what they will learn


In this post I would like to present you the way I use Pleco's flashcard feature.

# Pleco's flashcard feature

First, I will explain how flashcards work in Pleco.

## Categories

Categories are Pleco's way of organizing your flashcards.
Each card can be assigned to one or multiple categories. 

Whenever you look at a word in Pleco's dictionary, there will be a plus icon at the top of the screen. 
Clicking this icon, will add the card to the default category. 
Holding it will offer you with a selection of categories you can add the card to.

Pleco comes with categories for all HSK levels.
I added categories for each chapter of my Mandarin textbook. 
This way I can easily target the vocabulary for a certain chapter. 

Below you see an example of a flashcard that is assigned to two categories. 
It is included in the fifth HSK level as well as the first lesson of the textbook I use ([當代中文課程](https://mtc.ntnu.edu.tw/eng/book/A_Course_in_Contemporary_Chinese.html)).

{:.center}
![Flashcard that belongs to multiple categories](/images/2020/05/multiple_categories.png){:width="60%"}

## Test profiles

Next up are text profiles. 
They define how you test for your flashcard knowledge. 



If you go to the menu and click 

*Flashcards->New Test->Profile*,
{:.center}

Pleco will present you with the default selection of test profiles.

There is a lot of room for customization here. 
One of the most most important options is the test type. 
It determines how you are test for your flashcard knowledge.

### Which test type I use
In total, Pleco offers six test types. 
There's *Review only*, where you only look at the flashcard. 
Or *Multiple-choice*, where you try to choose the correct answer out of a set of possible answers. 

My favorite is **Fill-in-the-blanks**. 
Here the app shows you some part of the dictionary entry and you have to enter the rest. 
I set it such that Pleco shows me the definition and I have to enter the characters.
While entering the characters, I try to think of the right tones and see if they match the correct answer. 

My reasoning behind this is that this way I can test all parts of a word in one go. 
I will test pronunciation and tones by trying to come up with them before writing the character. 
Also I'll test writing the character itself, because I have to input it. 
After I input the characters, Pleco will play the dictionary entries audio as well.
For me this worked better than the other test types.

Below you can see the progression through the test. 

**Left**&nbsp;&nbsp;&nbsp;&nbsp; Pleco shows the English definition and prompts for the characters

**Middle**&nbsp;&nbsp;&nbsp;&nbsp; I draw the characters. While drawing, I think of the correct tones and syllables for the entry.

**Right**&nbsp;&nbsp;&nbsp;&nbsp; After filling in all the gaps, Pleco wants me to grade how well I remembered everything.

{:.center}
![Pleco's Fill-in-the-blanks screen](/images/2020/05/app_overview.png){:width="80%"}


To enhance my learning experience, I added custom test profiles.
Below I will explain to you how I have everything set up. 



# My learning profiles


Before a card can advance to the 復習 test, I have to review it correctly at least seven times in a row. 
I experimented with three repetitions here in the beginning.
But I found that I still forget new words rather quickly. 
So I increased the threshold to seven. 
So far, this works pretty good for me. 


## 當代中文課程 - Lessons from the textbook 'A Course in Contemporary Chinese'
I'm using the textbook series [A Course in Contemporary Chinese - 當代中文課程](https://mtc.ntnu.edu.tw/eng/book/A_Course_in_Contemporary_Chinese.html) to learn Mandarin.
So these textbooks are my main resource for new characters. 

My typical workflow looks like this: 
1. Add all words of the current lesson into a category in Pleco. 
The name of the category is the number of the lesson. To the first lesson will be called 當代中文課程/第一課.
2. Every day, test myself on all the words. 
Apart from checking whether I answered the correct seven times in a row, I added a time based filter. 
This filter only allows cards that I have not reviewed in the last 24 hours. 
That way I am forced to repeat the card for at least a week.
I found that otherwise I would answer it correctly multiple times a day but then forget it in the long run. 




## 生詞 - Words I encountered in the wild
Of course, learning only new words from a textbook is not enough. 
Every time I read a news article in Mandarin I encounter new words. 
So naturally I wanted to find a way of incorporating them in my flashcard system. 
What I do is the following.

Each time I think a new character is worth remembering, I click the small plus icon at the top.  
Pleco then adds the current word to your default flashcard category. 

{:.center}
![Plus button](/images/2020/05/plus_button.jpg){:width="40%"}




## 成語 - Chengyu
This category is for [chengyu](https://en.wikipedia.org/wiki/Chengyu) that I want to incorporate  in my active vocabulary. 
I'm very selective with the chengyu I try to learn, because I forget them very quickly. 
That's why I stick to the following rule.
> Only learn a chengyu if you've heard a native speaker use it at least three times 


- TODO Describe algorithm

## 復習 - Repetition

This profile sets the base for my flashcard learning. 
I include cards from all categories. 
But those cards are only included in the test if I continuously answered them correct for at least seven times.



If you don't look at your flashcards for a long time, the number of cards you have to repeat gets higher and higher. 

## How the different tests work together

{:.center}
![Vocabulary movement](/images/2020/05/vocabulary_movement.png){:with="60%"}

### Using these profiles 

If you want to play around with these profiles, you can download a clone of my database [here](https://bewagner.github.io/assets/flashbackup.pqb).
Make sure to backup your database before you import it!

# Additional filter profiles
- TODO 

## Words longer than four characters
- TODO 

## Display new words instead of daily repetition
- TODO 

# Customizing the scoring mechanism
- TODO 

# Anki 

For the sake of completeness I want to mention that there's another good flashcard app: [Anki](https://www.ankiapp.com/). 

Anki is a spaced repetition app. 
It allows for richer content, like music and images, in your flashcards.
I've made positive experiences using it to learn for classes. 

But for Mandarin I found Pleco to be superior. 
Using Anki would have meant using two apps. 
With Pleco I get all the features I need in one app. 
Also, the integration between Pleco's dictionary and flashcard database works very well. 
When you look up a new word, you press the plus button to add it to your flashcard database. 
That's it. 
Thus I stayed with Pleco for spaced repetition. 

# Conclusion
- TODO 
