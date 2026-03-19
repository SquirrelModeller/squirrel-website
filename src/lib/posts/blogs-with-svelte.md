---
title: Blogs with Svelte
date: 2026-03-18
description: Re-inventing the wheel, but this time with markdown and questionable decisions
---

Like any self-respecting Nix user, I obviously needed my own blog.

Not because I have something particularly insightful to say, nor because the internet is desperately waiting for yet another opinionated developer to start writing essays about software. The world already has an absolutely unreasonable number of blogs written by people far more qualified than me. But that is not the point. The point is that the correct solution to any software problem is to **reinvent infrastructure that already exists**, preferably in a slightly more complicated way than necessary, and ideally using tools that were never intended to solve that particular problem in the first place.

Naturally, instead of using one of the **thousands** of perfectly serviceable blog engines, static site generators, and publishing platforms that already exist and have been battle-tested by entire communities, I decided to build one myself using **Svelte**, a framework that excels at many things but was definitely not designed with "yet another custom blog engine" as its primary selling point. Because pain builds character, and because the only thing more satisfying than solving a problem is solving it again in a more convoluted way.

## The Goal

The dream for this system is refreshingly simple, and if everything works correctly the workflow should look something like this.

1. Write a markdown file.
1. Drop it into a folder.
1. Watch it **automatically appear on the website**.

There is no manual route wiring, no touching HTML unless I explicitly want to customize something, and no need to update navigation files or database entries just because I felt like writing a paragraph about some weird engineering rabbit hole I fell into at 2 AM. The idea is that the moment I create a file like:

```
my-new-post.md
```
it should magically appear at:
```
/blog/my-new-post
```

All statically generated, completely predictable, and without needing a server, database, CMS, or any other moving parts that inevitably decide to explode at the worst possible time.

## The Rough Idea

The structure of the project ends up looking something like this.
```
src/
  lib/
    posts/
      my-post.md
      another-post.md
```


Those markdown files are not pages themselves, but they act as content that Svelte can discover automatically. Once Svelte knows about them, they can be turned into actual routes on the site.

The end result looks like this:
```
/blog/<blog-post>
```

Which means that each markdown file becomes a page, and the name of the file becomes the URL. This is where **slugs** enter the picture, which is just a fancy term for “the human-readable identifier that appears in the URL”.

So if the file is called:
```
hello-world.md
```
the page becomes:
```
/blog/hello-world
```

## A Quick Svelte Refresher

Svelte has one of the most bizarre yet strangely elegant routing systems you will encounter, because the router is essentially your filesystem. File names become URLs, which sounds mildly cursed at first but becomes surprisingly convenient once you get used to it.

For example, this file:
```
src/routes/blog/+page.svelte
```
magically becomes the page:

```
/blog/
```

There is no route configuration file and no mapping between URLs and controllers. Instead, the structure of the folders literally *is* the routing system.

The interesting part comes when we introduce a folder called `[slug]`. In SvelteKit, anything inside square brackets represents a **dynamic route parameter**, which means that the value inside the URL is captured and passed to the page.

This folder:
```
src/routes/blog/[slug]/+page.svelte
```

is therefore responsible for handling pages like:
```
/blog/my-post
/blog/some-random-thought
/blog/i-broke-production-again
```

Inside the page logic, the `slug` tells us exactly which markdown file we need to load.

## Markdown, but with Superpowers

The moment markdown gets compiled through **mdsvex**, things become much more interesting than plain text formatting.

Normally markdown is just a way to write simple formatted documents, but mdsvex allows it to be compiled into actual Svelte components. That means your markdown file is no longer just a document, it becomes part of the application.

Which also means you can insert **actual HTML** inside it.

Suddenly your supposedly simple blog post can contain custom layouts, embedded pages, interactive widgets, styled callouts, or whatever other strange experiment you feel like trying.

In other words, you are writing **mini web pages disguised as markdown**.

## Images

Images work exactly how you would expect. Because SvelteKit serves everything inside the `static` directory directly from the site root, you can place images there and reference them from markdown.

```html
<img src="/assets/SquirrelModeller.svg" alt="Logo" width="100"/>
```
Which renders as:
<img src="/assets/SquirrelModeller.svg" alt="Logo" width="100"/>

Nothing particularly fancy here, but the important part is that it behaves predictably and works in both development and production without needing any additional configuration.

## Links

Markdown links still behave normally, which is exactly what you would hope.
```
[links](https://squirrel.talosvault.net/)
```
Example:
[Visit my site](https://squirrel.talosvault.net/)

So far this all behaves like regular markdown, which is reassuring because if markdown suddenly decided to stop being markdown that would probably be the moment this entire system collapses into chaos.

# And Then Things Get Weird


The moment you realize that markdown happily accepts raw HTML, the system becomes significantly more powerful and slightly more dangerous.

For example, you can embed an entire website **inside a blog post**.
```html
<iframe
  src="https://squirrel.talosvault.net/"
  width="100%"
  height="600"
  style="border:1px solid #ccc; border-radius:8px;"
></iframe>
```
Result:
<iframe src="https://squirrel.talosvault.net/" width="100%" height="600" style="border:1px solid #ccc; border-radius:8px;" ></iframe>

Yes, that is in fact my website embedded inside a blog post that lives on my website. Which means the website contains a page that contains the website that contains the page that contains the website again. This kind of recursive nonsense is what I now dub as **Blog-ception**, and it serves absolutely no practical purpose except proving that the system is flexible enough to let you shoot yourself in the foot in increasingly creative ways.

## The Hidden Superpower

Once HTML is allowed inside markdown, the entire design system of the site suddenly becomes available. For example, if your main CSS file defines something like a callout component, you can simply use it directly inside the markdown.

You can create thing like buttons:
```html
<a href="/" style="
display:inline-block;
padding:8px 14px;
background:#333;
color:white;
border-radius:6px;
text-decoration:none;">
Go home before something breaks
</a>
```

<a href="/" style="
display:inline-block;
padding:8px 14px;
background:#333;
color:white;
border-radius:6px;
text-decoration:none;">
Because why not???
</a>


At this point the markdown file is effectively acting as a lightweight Svelte page, except you are writing it in a format that still feels like documentation.

On this website, for example, there is a CSS class called `label` defined in `app.css`. Because the markdown content ultimately becomes part of the same DOM, I can simply reference that class directly.

<p class="label">I am using the label class</p>

This means blog posts automatically inherit the site's styling without needing to redefine anything. If the CSS changes later, the posts change with it, which feels slightly like witchcraft the first time you see it working.

## The Final Workflow

After all of this infrastructure is in place, the actual workflow becomes almost stupidly simple.

1. Write a markdown file.
1. Drop it into `src/lib/posts`
1. Rebuild the site.
1. Congratulations, you now have a new blog post.

There is no CMS interface, no dashboard, and no administrative panel trying to convince you to upgrade to the premium plan just so you can change the background color. Everything is just files.

## Closing Thoughts

Did I reinvent the wheel?

Absolutely.

Was any of this necessary?

Not even slightly.

There are countless tools that could have solved this problem in five minutes with far less effort and significantly fewer opportunities to break things in spectacular ways. But building the system yourself has a certain charm, because now I have a blog engine that does exactly what I want, integrates perfectly with the rest of the site, and lets me embed random HTML experiments directly inside my posts. More importantly, it allows me to write markdown, publish static pages, and occasionally create recursive website embeddings that should probably never exist. But to be honest, that feels like exactly the kind of engineering decision I can live with.

<div style="padding:1rem;border-left:4px solid orange;background:#fff7e6">
  Note: This blog has been proofread by ChatGPT.
</div>
