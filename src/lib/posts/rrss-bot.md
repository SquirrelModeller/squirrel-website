---
title: READ MY BLOGS (YOU NO LONGER HAVE A CHOICE)
date: 2026-03-25
excerpt: Forcing people to read our blogs with push messages
tags: ['code', 'blog']
---

## READ MY BLOGS

Once upon a time, the internet ran on this deeply comforting, borderline delusional belief that if you simply wrote something good enough, polished it enough, and sprinkled just the right amount of SEO fairy dust on top, people would somehow discover it, read it, appreciate it, and maybe, if the starts aligned, come back for more.

But let’s be honest for a moment.

Your blog is not a lighthouse guiding lost ships safely home through the fog. It is a plastic bottle in the ocean, drifting endlessly among ten million identical bottles, all containing messages written with the same quiet desperation, all competing for attention in an environment that fundamentally does not care. The only reliable audience you have is a swarm of bots politely pretending to be interested.

So instead of waiting patiently like a well-behaved content creator, hoping someone might one day stumble across my work while desperately googling "how to center a div" I decided to adopt a model that is, at the very least, honest:

> If attention will not come to you, you go and mug it in a dark alley.

## RingRSS - an enslaved RSS reader

[**RingRSS (RRSS)**](https://github.com/SquirrelModeller/rrss) is what happens when you stop pretending RSS is a polite, pull-based system and instead weaponize it into something that behaves more like a persistent, mildly aggressive courier that refuses to take "I’ll read it later" as a valid answer.

It does not sit quietly in the corner waiting to be opened like a neglected app icon gathering dust. It detects updates with the same urgency as a smoke alarm detecting slightly overcooked toast, and then immediately injects those updates into systems people are already staring at, whether they explicitly asked for it or not.

Right now that system is Matrix, because modern communication has somehow converged on encrypted group chats where half the messages are memes and the other half are existential complaints, but the idea generalizes disturbingly well. If a system can receive a message, RRSS can deliver content into it with all the subtlety of a brick through a window.

Because if something is published, it should not sit around hoping to be discovered. It should move. It should propagate. It should behave like information that actually wants to be seen, rather than politely waiting its turn in a line that never ends.

## Overengineering, but now it's personal

This started, as these things always do, as "just a small script" which is the software equivalent of saying "I’ll just have one drink" and then waking up two weeks later with a full-blown system and a vague sense of how things escalated so dramatically.

At this point, there is a scheduler, a persistence layer, deterministic deduplication, an outbox-style notification pipeline, retry semantics, and enough state management that it no longer feels like a script but rather a small, deeply committed operations department that has not taken a day off since it was conceived.

None of this was strictly necessary if the goal had been "it works most of the time" but that was never the goal. I didn’t want duplicate notifications. I didn’t want race conditions where two parts of the system briefly disagree about reality and both decide to send the same entry just to be safe. I didn’t want state evaporating the moment the process restarts, leaving behind a vague sense of "something probably happened."

I wanted determinism.

Every entry maps to a stable identifier. Every insert either happens exactly once or not at all, with no Schrödinger’s database state lurking in between. Delivery is not assumed, implied, or emotionally inferred. It is tracked, recorded, acknowledged, and, if necessary, aggressively retried until the system either succeeds or gives up in a controlled and documented manner.

At some point, I ended up writing an actual specification, which is deeply ironic given that I spent entire university courses being force-fed software engineering theory, writing specifications I did not care about for systems I did not respect, all while mentally planning my escape.

And now I am voluntarily doing it, because I want the ability to delete this entire Python implementation one day, rewrite it in Rust like a responsible adult with performance anxiety, and have it behave exactly the same, down to the last obscure edge case that nobody else would notice but would absolutely bother me.

## The scheduler: tiny bureaucrat with a clipboard

At the center of RRSS is a scheduler.

Feeds are jobs. They have deadlines. They are scheduled, rescheduled, quietly removed when they disappear, and delayed when they fail, all without drama or ceremony. If everything works, they are placed right back into rotation as if nothing ever happened.

It is uncomfortably close to how real production systems behave, just condensed into something small enough that you can still hold the entire mental model in your head without needing a whiteboard, three diagrams, and a mild existential crisis halfway through.

Then there is the notification pipeline, which is effectively an outbox with trust issues. New entries become jobs, jobs are picked up and delivered, and if the universe decides to be uncooperative, they are retried with increasing insistence. If they fail often enough, they are eventually dropped, not out of mercy, but out of a measured and well-defined exhaustion of patience.

## Encryption, because escalation is a lifestyle

The current sink is Matrix, which means every single blog post is wrapped in end-to-end encryption like it’s a classified document being transported between intelligence agencies.

This was not the result of a carefully constructed threat model or a rigorous security analysis. This is what happens when engineers want a place to complain in peace, and suddenly everything built on top of that inherits the same level of operational secrecy.

So now we have the completely reasonable situation where public blog posts, written for literally anyone with an internet connection, are being delivered through encrypted channels as if they contain sensitive geopolitical intelligence.

It is unnecessary. It is excessive. It is also objectively funny, and therefore it stays.

## Final thought

RRSS exists because passive systems lose, not dramatically, but slowly and consistently in ways that are easy to ignore until there is nothing left paying attention.

They rely on attention being given voluntarily, and attention is the one resource you cannot assume, predict, or politely request without being quietly ignored in favor of something louder, faster, or simply more present.

So RRSS takes a more direct approach. If something is published, it does not wait patiently in line hoping to be noticed. It moves, it propagates, it inserts itself into places where attention already exists, and it does so without asking for permission first.

And if that results in people getting pinged with your blog posts whether they explicitly asked for it or not, then that is not a flaw in the system.

