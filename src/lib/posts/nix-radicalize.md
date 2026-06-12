---
title: How to Radicalize Your Friends into NixOS
date: 2026-06-09
excerpt: Someone did this to you. Now it's your turn.
tags: ['nixos', 'nix']
---

You have been using NixOS for one year. That is long enough. You have `nixos-rebuild switch`'d in the dark. You have explained the Nix store to someone at a party and watched their eyes glaze over like a donut. You have used the word "declarative" in casual conversation and felt nothing.

You know who you are, and you have accepted it.

But *they* don't know yet.

And that is your advantage.

## The Target
You are not going after Ubuntu users.

Ubuntu users are fine. Ubuntu users are golden retrievers. They are happy and they are clean and they have `apt` and a support forum from 2009 that still has the answer. Leave them. They are living their best life. It is not your life, but it is a life.

You are not going after Gentoo users either. Gentoo users are a different religion entirely, they are compiling their kernel the way medieval flagellants beat themselves with chains, but with *satisfaction*, with the look of someone who has transcended the concept of waiting. They are beyond your reach and beyond saving and, frankly, beyond this place.

No.

Your target is the **Arch User.**

Specifically: the *recently stabilized* Arch user. The one who spent two weeks in the jaw of the Arch wiki getting chewed up and spat out and emerged on the other side slightly concussed, blinking in the light, going "okay I think I understand what a bootloader is now?"

They configured their pacman mirrors. They have an AUR helper. They have a rice they're quietly proud of and will not bring up unless asked, at which point they will not stop. They feel, for the first time in their computing life, a dangerous sense of competence - like a toddler who has just learned to open the fridge and is now standing in the kitchen at 3am, absolutely *unhinged with power*.

This is when the brain is most vulnerable.

This is when you strike.


## Phase One: The Lure
You need software. Not just any software. The software has to be real, it has to be cool, and - crucially - it has to be exactly annoying enough to install that they will feel the pain in their teeth.

This is the trap. This is the cheese.

Find something actually useful. An obscure tool. A neat little utility. Something that makes them go "oh actually that looks sick." Then go to them, casually, like a man who has not been planning this for six months, and say:

*"Hey, have you tried [SOFTWARE]? It's pretty cool, you should check it out haha"*

Note the `haha`. The `haha` is the hand extended in friendship. The `haha` is the first cigarette offered by someone who has been smoking for years and knows exactly what they're doing.

They say "oh cool, how do I get it?"

And here is where you become a monster.


## Phase Two: The Pit
"Oh it's easy, just build from source."

They go to the GitHub. They `git clone`. They look at the README. The README says:

```
Dependencies:
- libsomething >= 2.4
- another-thing
- that-one-library that has its own build system for some reason
- pkg-config (obviously)
- cmake (obviously)
- the tears of the developer who wrote this
```


The build fails. They fix it. It fails again, differently, which is somehow worse. They are now crouched over their terminal at 11pm surrounded by Stack Overflow tabs, man pages, and the kind of silence that used to feel comfortable. Three dependencies are available. One is the wrong version. One lives on AUR under a name that is close but not quite right, maintained by someone who last logged in in 2021. One simply does not exist anywhere and they will need to build it from source, which has its own dependencies, which are fine actually, except for the one that requires Python 2.

They have been in dependency hell for 45 minutes.

Dependency hell is exactly like regular hell, except the UI is worse and you built the furniture yourself.


## Phase Three: The Frog Has No Idea It's In A Pot
You wait.

You let them suffer. You do not intervene. You are Attenborough, and the frog is boiling, and you are narrating in a soft reverent voice about the extraordinary tenacity of the creature before you, its remarkable capacity for hope.

After the right amount of time, not so long they give up, not so short they don't feel the pain, you say, with the casual energy of someone mentioning they prefer a particular brand of coffee:

"Oh yeah I just ran nix run github:user/application and it worked"

That's it. That's the whole thing. You don't explain. You don't evangelize. You don't pull out the manifesto. You let those eleven words sit in the air like a grenade with the pin already out, already rolling gently across the floor, bumping softly against their foot.


They will ask what that is.

And you say, still casual, still friendly, still the person who said `haha` exactly 45 minutes ago: "oh it's just a nix thing, it like, fetches and runs it without installing anything, handles all the deps itself"

And then you say nothing.

You have said enough. You have said, in fact, exactly enough.


## Phase Four: The Pull
What happens next is not your doing.
This is important. You are not radicalizing anyone. You are simply a passive observer, a gardener who planted a seed and stepped back and said *nature will take its course*, while privately knowing exactly what kind of tree this is and how large it grows and how deep the roots go and that it will eventually crack the foundation of their house.

The thing about the Nix pull is that it doesn't feel like indoctrination. It feels like relief. It feels like coming up for air.

They will install Nix. Then they will read the wiki. Then they will look up flakes. Then they will look up flakes again because the first time didn't make sense. Then it will make sense and they will feel the specific unhinged joy of something clicking into place, the same joy you felt, the same jaw-drop, the same *oh no* of someone who has just understood what reproducibility means and is already looking at their entire system differently.

Then they will try to explain flakes to someone at a party.

And that person's eyes will glaze over.


## Epilogue: You Were Once The Target
Here is the part you've been ignoring since the beginning of this blog: Someone did this to you.

Sit with that. The casual mention. The obscure tool. The build that failed in exactly the right way for exactly the right amount of time. The nix run dropped into the conversation like a stone into still water, and you watched the rings spread and thought nothing of it.

You didn't find NixOS.

NixOS found you.

You were the recently-stabilized Arch user once. You were the one with the AUR helper and the rice and the dangerous sense of competence, standing in the kitchen of your computing life at 3am, absolutely unhinged with power, not yet knowing what was coming.

You know who you are, you know exactly who the Arch user is, and you have already thought about where to stand so the smoke drifts naturally toward them.


<div style="padding:1rem;border-left:4px solid orange;background:#fff7e6">
  <p style="color: black">Note: This blog has been proofread by Claude. It helped me find specific words and re-structure some sentences.</p>
</div>
