import type { Story } from '$lib/saga/types'
import { fx } from '$lib/saga/engine'

const KEY_PAGES = [
  '/',
  '/about',
  '/contact',
  '/friends',
  '/blog/blogs-with-svelte',
  '/blog/gpu-passthrough',
  '/blog/manga-writing',
  '/blog/rrss-bot'
]

export const raccoons: Story = {
  id: 'raccoons',
  scenes: [
    // DAY 0

    {
      id: 'day0_cookies',
      minDay: 0,
      text: 'hi. just some formalities.\n\nmay i use cookies? just the boring necessary ones. i promise they won\'t do anything suspicious.\n\n(they will do something a little suspicious.)',
      choices: [
        {
          label: 'sure, fine.',
          effect: fx.noop(),
          reaction: ['wonderful. we\'ve been practicing that announcement for three days.']
        },
        {
          label: 'no.',
          effect: fx.spite(),
          reaction: [
            'the cookies have been informed.',
            'they are taking it personally.',
            'we are proceeding anyway. this has been logged somewhere.'
          ]
        },
        {
          label: "only if they're oatmeal raisin.",
          effect: fx.weird(),
          reaction: [
            'they are not oatmeal raisin.',
            'they are whatever cookies need to be.',
            'they are doing their best.'
          ]
        }
      ]
    },

    {
      id: 'day0_marvin',
      minDay: 0,
      text: "one more thing.\n\nthere is a raccoon outside. his name is Marvin. he needs somewhere to stay - just temporarily, he says, though he has brought a duffel bag and what appears to be a small rug.\n\nhe's asked about the closet.",
      choices: [
        {
          label: 'fine. one raccoon.',
          effect: fx.compound(
            fx.set({ raccoons: 1 }),
            fx.addCritter({ id: 'marvin', name: 'Marvin', species: 'raccoon', bed: 'closet floor (for now)', status: 'resident' })
          ),
          reaction: ['Marvin says thank you. he has very nice manners for someone who brought a rug.']
        },
        {
          label: "define 'temporarily'.",
          effect: fx.compound(
            fx.weird(),
            fx.set({ raccoons: 1 }),
            fx.addCritter({ id: 'marvin', name: 'Marvin', species: 'raccoon', bed: 'closet floor (for now)', status: 'resident' })
          ),
          reaction: ['he considered the question carefully.', "he's inside now."]
        },
        {
          label: 'absolutely not.',
          effect: fx.spite(),
          reaction: [
            'Marvin has heard this. he is sitting on the step.',
            'he brought a rug.',
            "it's raining a little."
          ]
        }
      ]
    },

    {
      id: 'day0_goodnight',
      minDay: 0,
      text: (s) =>
        s.raccoons > 0
          ? "Marvin says hello. he has already found the shelf.\n\nhe has thoughts about the shelf. we'll get to them.\n\ncome back tomorrow."
          : "update.\n\nit turns out your closet lock was a model that Marvin specifically has encountered before.\n\nhe didn't break it. he just... reasoned with it.\n\nthe lock's warranty does not cover this.\n\nMarvin is inside. he found the shelf. he has thoughts about it.\n\ncome back tomorrow.",
      choices: [
        {
          label: 'how.',
          condition: (s) => s.raccoons === 0,
          effect: fx.compound(
            fx.weird(),
            fx.set({ raccoons: 1 }),
            fx.addCritter({ id: 'marvin', name: 'Marvin', species: 'raccoon', bed: 'closet floor (for now)', status: 'resident' })
          ),
          reaction: ['no answer is given.']
        },
        {
          label: 'goodnight.',
          effect: fx.noop(),
          reaction: []
        }
      ]
    },

    // DAY 1
    {
      id: 'day1_cousins',
      minDay: 1,
      text: (s) =>
        `MORNING.\n\nMarvin has sent a message. three of his cousins were in the area last night and needed somewhere to stay. they are already inside. he wanted you to know that he asked first, technically - he sent the message at 2am.\n\n${s.spite > 0 ? "they used the same door Marvin used. apparently it works from both sides now." : "they came with luggage. one of them has a name tag. it says Phyllis. the second one introduced himself as Marvin. the third hasn't said anything. she brought a plant."}`,
      choices: [
        {
          label: 'sure, they can stay.',
          effect: fx.compound(
            (s) => ({ raccoons: s.raccoons + 3 }),
            fx.addCritter({ id: 'phyllis', name: 'Phyllis', species: 'raccoon', bed: null, status: 'resident' }),
            fx.addCritter({ id: 'other_marvin', name: 'Other Marvin', species: 'raccoon', bed: null, status: 'resident' }),
            fx.addCritter({ id: 'unnamed', name: '???', species: 'raccoon', bed: '???', status: 'resident' })
          ),
          reaction: [
            'Phyllis says thank you formally. Other Marvin waves.',
            'the third one looks at you for a long moment and then goes back to the plant.'
          ]
        },
        {
          label: 'out. now.',
          effect: fx.spite(),
          reaction: [
            'they have acknowledged this.',
            'Phyllis is writing something down.',
            'they are still inside.'
          ]
        }
      ]
    },

    {
      id: 'day1_brawl',
      minDay: 1,
      brawl: true,
      text: (s) =>
        `there has been an incident.\n\n${s.raccoons > 1 ? "Marvin and the cousins got into a brawl with three local squirrels behind the bins. it is unclear who started it. both sides are very clear on who started it." : "Marvin got into a brawl with three local squirrels behind the bins."}\n\nthere is fur everywhere. a bin has been moved. property damages: $40.\n\nsomeone has to pay.`,
      choices: [
        {
          label: "i'll cover it.",
          effect: fx.compound(fx.money(-40), fx.set({ squirrels: 'paid' })),
          reaction: ['the squirrels accepted this. one of them nodded at you in a way that felt meaningful.']
        },
        {
          label: 'bill the raccoons.',
          effect: fx.compound(fx.debt(40), fx.set({ squirrels: 'billed' })),
          reaction: [
            'Marvin has acknowledged the debt. he has written it on a Post-it and stuck it to the shelf.',
            'the Post-it says "IOUs: $40 (disputed)".'
          ]
        },
        {
          label: 'bill the squirrels. they started it.',
          effect: fx.compound(fx.spite(), fx.set({ squirrels: 'blamed' })),
          reaction: ['the squirrels have been informed.', 'Phyllis is writing something down again.']
        }
      ]
    },

    // DAY 2

    {
      id: 'day2_key',
      minDay: 2,
      text: "Marvin has locked himself out of the closet.\n\nyes, the closet has a lock. he installed it last tuesday. he did not mention this.\n\nthe spare key is somewhere in the building. he thinks he left it somewhere someone would find it. or maybe somewhere they wouldn't. he was in a weird mood.\n\n(you have 10 minutes. the key is somewhere on this website - a page you can visit. the blog, maybe. the homepage. contact. somewhere. it's small. look around.)\n\n(this tab will know when you've found it.)",
      choices: [
        {
          label: 'here. try not to lose it again.',
          condition: (s) => s.keyFound,
          effect: fx.noop(),
          reaction: ["Marvin is very relieved. he's trying not to show it."]
        },
        {
          label: 'you owe me.',
          condition: (s) => s.keyFound,
          effect: fx.debt(20),
          reaction: ['he adds a Post-it. the shelf is getting crowded.']
        },
        {
          label: 'pay the locksmith.',
          condition: (s) => !s.keyFound && s.money >= 80,
          effect: fx.money(-80),
          reaction: ['Marvin is inside. he said nothing. the plant was returned to the unnamed one.']
        },
        {
          label: 'he can sleep in the hallway. one night.',
          condition: (s) => !s.keyFound,
          effect: fx.spite(),
          reaction: ['Marvin does not complain. the plant seems fine.']
        }
      ]
    },

    // DAY 3

    {
      id: 'day3_jazz',
      minDay: 3,
      text: "it is 3am.\n\nthe raccoons have formed a jazz trio. Marvin is on saxophone. Phyllis is on what appears to be a very small upright bass. Other Marvin is doing something percussive with the vending machine.\n\nthey are not good.\n\nthey feel good about it though.",
      choices: [
        {
          label: 'quiet hours. 10pm to 8am.',
          effect: fx.set({ jazz: 'hours_set' }),
          reaction: [
            'Marvin has acknowledged this formally. he has taped the hours to the closet door.',
            'they practiced until 9:59pm. to the second.'
          ]
        },
        {
          label: "no hours. they're artists.",
          effect: fx.compound(fx.weird(), fx.set({ jazz: 'unrestricted' })),
          reaction: [
            'Marvin wept a little. quietly, so as not to wake you.',
            'you were already awake.'
          ]
        },
        {
          label: 'confiscate the saxophone.',
          effect: fx.compound(fx.spite(), fx.set({ jazz: 'no_sax' })),
          reaction: [
            'Marvin has handed it over without a word.',
            'the percussion continues.'
          ]
        }
      ]
    },

    // DAY 4

    {
      id: 'day4_campaign',
      minDay: 4,
      text: "Marvin is running for local office.\n\nplatform: \"more closets, fewer questions.\"\n\nhe needs $200 for lawn signs and a publicist. the publicist is also a raccoon. this was not presented as relevant information.",
      choices: [
        {
          label: 'endorse and fund it.',
          condition: (s) => s.money >= 200,
          effect: fx.compound(fx.money(-200), fx.set({ marvin_campaign: 'funded' })),
          reaction: [
            'Marvin shook your hand. he has a very firm handshake.',
            'the publicist took notes and left without introducing herself.'
          ]
        },
        {
          label: 'endorse, but no money.',
          effect: fx.set({ marvin_campaign: 'endorsed' }),
          reaction: [
            'Marvin thanked you. he said he\'d make it work.',
            'Phyllis is already making signs by hand. they are surprisingly good.'
          ]
        },
        {
          label: 'endorse his opponent.',
          effect: fx.compound(fx.spite(), fx.set({ marvin_campaign: 'opposed' })),
          reaction: [
            'Marvin found out within the hour.',
            "he hasn't said anything. he made eye contact once."
          ]
        },
        {
          label: "i'd like to run instead.",
          effect: fx.weird(),
          reaction: [
            'Marvin considered this for a long moment.',
            'he consulted Phyllis.',
            'Phyllis consulted the unnamed one.',
            'the unnamed one looked out the window for a while.',
            'you are not eligible. the reason was not shared.'
          ]
        }
      ]
    },

    // DAY 5

    {
      id: 'day5_review',
      minDay: 5,
      text: (s) =>
        `Marvin has prepared a report. he slides it under the door. it is formatted. there are headers.\n\nSTATE OF THE CLOSET - Q1\nraccoons present: ${s.raccoons}\noutstanding debt: $${s.debt.toFixed(2)}\ntimes you said no: ${s.spite}\nincidents: you know which ones\n\nhe has also prepared a song. in your honor. he would like to perform it now, in lieu of repaying the debt.\n\n($title, the floor is yours to decide.)`,
      choices: [
        {
          label: 'accept. wipe the debt.',
          effect: fx.wipeDebt(),
          reaction: [
            'Marvin performed the song.',
            'it was three minutes long. it was about you specifically.',
            'Other Marvin cried. nobody acknowledged this.'
          ]
        },
        {
          label: 'i want the money.',
          effect: fx.spite(),
          reaction: [
            'Marvin folded the report carefully.',
            'he took the song with him.'
          ]
        },
        {
          label: 'i want a better song first.',
          effect: fx.weird(),
          reaction: [
            'Marvin nodded slowly.',
            'he went back inside.',
            'this is now an ongoing project.'
          ]
        }
      ]
    },

    // DAY 6

    {
      id: 'day6_results_won',
      minDay: 6,
      condition: (s) => s.marvin_campaign !== 'opposed' && s.spite < 3,
      text: "the results are in.\n\nMarvin won.\n\nhis acceptance speech was four minutes long. he thanked the closet. he thanked Phyllis. he thanked Other Marvin. he thanked the unnamed one by not mentioning her, which she apparently requested.\n\nhe thanked you last. it was the longest part.\n\nyou have been appointed Minister of Snacks. the position is unpaid. Marvin seemed to think this was a given.",
      choices: [
        {
          label: 'i accept the position.',
          effect: fx.set({ marvin_elected: true }),
          reaction: ['Marvin nodded. he seemed to have expected this.']
        },
        {
          label: 'i formally decline.',
          effect: fx.compound(fx.spite(), fx.set({ marvin_elected: true })),
          reaction: ['Marvin noted this.', 'he moved on very quickly.']
        }
      ]
    },

    {
      id: 'day6_results_lost',
      minDay: 6,
      condition: (s) => s.marvin_campaign === 'opposed' || s.spite >= 3,
      text: (s) =>
        `the results are in.\n\nMarvin lost. the margin was close. he thinks you had something to do with it. he hasn't said this. he doesn't need to.\n\nPhyllis is writing something down.${s.marvin_campaign === 'opposed' ? "\n\nhis opponent won. we still don't know who that is.\n\nOther Marvin left the room again." : ''}`,
      choices: [
        {
          label: 'i had nothing to do with it.',
          effect: fx.noop(),
          reaction: ['nobody responds.']
        },
        {
          label: 'i had a little to do with it.',
          effect: fx.weird(),
          reaction: ['Phyllis writes something down.', 'Other Marvin leaves the room.']
        }
      ]
    },

    // DAY 7

    {
      id: 'day7_squirrels_blamed',
      minDay: 7,
      condition: (s) => s.squirrels === 'blamed',
      text: "a scroll arrived this morning. it is very small. it was delivered by a squirrel in a blazer who left without making eye contact.\n\nyou have been named in Squirrels v. You (and Also Technically Marvin).\n\nPhyllis has been notified. she was not surprised. she had a folder ready.\n\nthe hearing is scheduled. you are required to appear.",
      choices: [
        {
          label: "i'll appear.",
          effect: fx.set({ court: 'pending' }),
          reaction: ["the scroll has been acknowledged.", "Marvin is getting his suit."],
          navigate: '/court'
        },
        {
          label: "i'd like to settle.",
          condition: (s) => s.money >= 60,
          effect: fx.compound(fx.money(-60), fx.set({ court: 'settled', squirrels: 'resolved' })),
          reaction: [
            'the settlement has been accepted.',
            'the squirrel in the blazer sent a very stiff thank-you note.'
          ]
        },
        {
          label: "i'd like to request a continuance.",
          effect: fx.set({ court: 'delayed' }),
          reaction: [
            'the continuance has been granted.',
            'the squirrel in the blazer made a note.',
            'the note did not look friendly.'
          ]
        }
      ]
    },

    {
      id: 'day7_squirrels_paid',
      minDay: 7,
      condition: (s) => s.squirrels === 'paid',
      text: "one of the squirrels from the brawl has been sitting outside the closet door for three days.\n\nhe hasn't said anything. he brought a small jar of jam. he appears to be waiting for something but won't specify what.\n\nMarvin says he's harmless. Marvin also let him use the vending machine.",
      choices: [
        {
          label: 'let him in.',
          effect: fx.addCritter({ id: 'gerald_sq', name: 'Gerald', species: 'squirrel', bed: null, status: 'resident' }),
          reaction: [
            'Gerald moved in quietly. he has very neat handwriting.',
            'he signed the wall near the door. just his name. Gerald.'
          ]
        },
        {
          label: 'accept the jam. maintain ambiguity.',
          effect: fx.weird(),
          reaction: ['he stays outside.', 'the jam is very good.']
        },
        {
          label: 'return the squirrel.',
          effect: fx.spite(),
          reaction: ['he leaves.', 'he takes the jam.']
        }
      ]
    },

    {
      id: 'day7_squirrels_billed',
      minDay: 7,
      condition: (s) => s.squirrels === 'billed',
      text: (s) =>
        `the raccoons have settled the squirrel debt. in acorns. 847 of them. the squirrels have accepted this. you don't know the exchange rate. nobody will tell you the exchange rate.\n\nMarvin has left a note: "handled it. you're welcome. please don't ask."${s.debt > 0 ? '\n\n(847 acorns has been calculated as $13.40. the Post-it has been updated.)' : ''}`,
      choices: [
        {
          label: 'noted.',
          effect: fx.debt(-13.40),
          reaction: []
        },
        {
          label: 'i have so many questions.',
          effect: fx.weird(),
          reaction: ['none are answered.']
        }
      ]
    },

    // DAY 8

    {
      id: 'day8_shelf',
      minDay: 8,
      text: "this has been going on for four days.\n\nOther Marvin and Phyllis both want the shelf. the top shelf, specifically. the good one. Marvin's shelf is not in dispute - Marvin has made his position very clear and nobody is testing it.\n\nthey have each submitted a written case. Phyllis's case is three pages. it is well-structured. there are footnotes. Other Marvin's case is one sentence: \"i was here first (technically).\"\n\nthe unnamed one has not been involved. she already has a spot. you don't know when that happened.\n\n$title, you are asked to rule.",
      choices: [
        {
          label: 'Phyllis gets the shelf.',
          effect: fx.updateBeds({ phyllis: 'top shelf', other_marvin: 'good floor' }),
          reaction: [
            'Phyllis accepted the ruling without expression. she updated her notes.',
            'Other Marvin took the good floor with surprising dignity.'
          ]
        },
        {
          label: 'Other Marvin gets the shelf.',
          effect: fx.updateBeds({ other_marvin: 'top shelf', phyllis: 'under the stairs' }),
          reaction: [
            'Other Marvin moved in immediately. he had a pillow ready.',
            'Phyllis took "under the stairs" without comment. she seems to have wanted this all along.'
          ]
        },
        {
          label: "nobody gets the shelf. it's storage now.",
          effect: fx.compound(
            fx.spite(),
            fx.updateBeds({ phyllis: 'coat rack', other_marvin: 'good floor' })
          ),
          reaction: [
            'both of them looked at you.',
            'then at each other.',
            'the shelf is now storage. the tension remains.'
          ]
        },
        {
          label: 'they share it. one week on, one week off.',
          effect: fx.compound(
            fx.weird(),
            fx.updateBeds({ phyllis: 'shelf (alternating)', other_marvin: 'shelf (alternating)' })
          ),
          reaction: [
            'they considered this.',
            'they have questions about jurisdiction but haven\'t asked them yet.'
          ]
        }
      ]
    },

    // DAY 9

    {
      id: 'day9_newsletter',
      minDay: 9,
      text: "Marvin has started a newsletter.\n\nit is called CLOSET ECONOMICS: A MONTHLY BRIEFING. it is not monthly. it has gone out four times this week.\n\ntopics covered so far: shelf valuation, the vending machine as infrastructure, a three-part series on ambient humidity, and an opinion piece titled \"the coat rack: menace or misunderstood?\"\n\nit has 47 subscribers. Marvin won't say how he found them.\n\none of them is your landlord. Marvin mentioned this casually. he moved on quickly.",
      choices: [
        {
          label: 'noted.',
          effect: fx.set({ newsletter: true }),
          reaction: ['Marvin appreciated the lack of pushback. issue five drops thursday.']
        },
        {
          label: 'which landlord.',
          effect: fx.compound(fx.weird(), fx.set({ newsletter: true })),
          reaction: ['Marvin said "yours" and changed the subject.', 'issue five drops thursday.']
        },
        {
          label: 'ask him to stop.',
          effect: fx.compound(fx.spite(), fx.set({ newsletter: true })),
          reaction: [
            'Marvin paused.',
            'he said he would "take it under consideration."',
            'issue five dropped wednesday. two days early.'
          ]
        }
      ]
    },

    // DAY 10

    {
      id: 'day10_yelp',
      minDay: 10,
      text: "Marvin has left a Yelp review of your closet.\n\nyou didn't know closets could be reviewed.\n\nthey can.",
      choices: [
        {
          label: 'respond to the review.',
          effect: fx.weird(),
          reaction: [
            'you typed a response. you deleted it. you typed it again.',
            'you posted it.',
            'Marvin replied within four minutes. he was very polite. you came off worse somehow.'
          ]
        },
        {
          label: 'do not respond.',
          effect: fx.noop(),
          reaction: []
        }
      ]
    },

    // DAY 11

    {
      id: 'day11_invoice',
      minDay: 11,
      text: (s) =>
        `there is a document under the door. it is formatted. there is a header. there is a logo - a small raccoon silhouette holding a briefcase.\n\nINVOICE - EMOTIONAL LABOUR, RETROSPECTIVE\nissued by: Marvin R., resident\nissued to: $title\n\nline items:\n- being delightful: ongoing\n- ambient mood uplift: daily, est. Q1–present\n- existing in the vicinity: see attached\n- the song (Q5 review): one-time, sentimental value${s.court === 'won' ? '\n- moral support during litigation: significant' : ''}${s.marvin_campaign === 'funded' ? '\n- campaign gratitude, retroactive: priceless (estimated)' : ''}\n\nTOTAL DUE: $0.00\n\nthis was a gift. he needs you to know that.`,
      choices: [
        {
          label: 'acknowledged.',
          effect: fx.noop(),
          reaction: [
            'Marvin slid a receipt under the door thirty seconds later.',
            'it just says "you\'re welcome."'
          ]
        },
        {
          label: 'file it.',
          effect: fx.weird(),
          reaction: [
            'Marvin appreciated this more than he let on.',
            'the unnamed one witnessed it. she said nothing. this felt like something.'
          ]
        },
        {
          label: 'this changes nothing.',
          effect: fx.spite(),
          reaction: [
            'Marvin was quiet for a moment.',
            'he slid another copy under the door.',
            'just in case.'
          ]
        }
      ]
    },

    // DAY 12+

    {
      id: 'day12_ongoing',
      minDay: 12,
      text: "new episodes will arrive on a vibes-based schedule.\n\nMarvin is writing them. he has a lot of thoughts.\n\nhow are you holding up.",
      choices: [
        {
          label: 'fine. surprisingly fine.',
          effect: fx.noop(),
          reaction: ['noted.']
        },
        {
          label: 'worse than yesterday.',
          effect: fx.spite(),
          reaction: ['Marvin has been informed.', 'he sent a fruit basket.', 'it was mostly acorns.']
        },
        {
          label: 'i miss the cookies.',
          effect: fx.weird(),
          reaction: [
            'the cookies have been informed.',
            'they are taking this well, actually.',
            'they knew you\'d come around.'
          ]
        }
      ]
    }
  ]
}

export function getYelpReview(spite: number): { stars: number; text: string } {
  if (spite === 0)
    return {
      stars: 5,
      text: "exceptional space. management is communicative and fair. the coat situation has improved. the vending machine was our idea and we stand by it. would recommend to any raccoon seeking stable accommodation. Marvin R., verified resident."
    }
  if (spite <= 2)
    return {
      stars: 4,
      text: "good space overall. management means well. occasionally makes decisions without full context but recovers. the shelf dispute was handled adequately. the coat situation remains a conversation. four stars. room to grow. Marvin R., verified resident."
    }
  if (spite <= 4)
    return {
      stars: 3,
      text: "the closet itself is fine. structurally sound. management has a complicated relationship with the word 'no.' we are working through it. the jazz hours ruling was noted. three stars. not leaving. Marvin R., verified resident."
    }
  return {
    stars: 2,
    text: "the space is adequate. management is a study in contrasts. we have documentation. Phyllis has documentation. the vending machine remains our greatest achievement despite everything. two stars. still not leaving. we have a lease. Marvin R., verified resident."
  }
}

export function pickKeyPage(): string {
  return KEY_PAGES[Math.floor(Math.random() * KEY_PAGES.length)]
}
