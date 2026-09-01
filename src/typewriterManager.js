const PRESET_TEXT_DATA = {
  front: {
    badge: '#1',
    title: 'THE SEVEN DEADLY SINS OF HUMANITY',
    text: `Pride
Humanity has always believed itself to stand above all others. Pride blinds the mind to its own imperfections, even when the entire world bears witness to its mistakes.

Greed
There is no quantity that can satisfy the truly greedy. They may possess everything within their reach, yet still covet what was never theirs to claim.

Envy
Envy is not merely the desire to possess what another has. At its darkest, it is the desire to witness another person stripped of the happiness they possess.

Wrath
Wrath can extinguish reason within a matter of seconds. Many irreversible acts begin with an emotion that lasts only for a fleeting moment.

Lust
Lust transforms desire into perceived necessity. Once the boundaries of morality begin to dissolve, humanity becomes capable of acts it once believed itself incapable of committing.

Gluttony
Gluttony extends far beyond the consumption of food. Power, wealth, attention, and even the lives of others can become objects of insatiable possession.

Sloth
Not every evil is committed by those who actively inflict suffering. Sometimes evil prevails simply because someone witnesses something wrong and chooses to remain indifferent.

The seven sins share one common origin.
They emerge from the most dangerous entity in existence.
Humanity itself.`,
  },

  side: {
    badge: '#2',
    title: 'THE HUMAN MIND CAN CREATE WHAT DOES NOT EXIST',
    text: `The human brain is an extraordinary instrument, capable of interpreting an immeasurable amount of information within fractions of a second. Yet the same mechanism that allows us to perceive reality can also distort it. Under certain circumstances, the mind can manufacture voices, silhouettes, sensations, and even entire perceptions that possess no physical existence whatsoever. One particularly unsettling phenomenon is known as felt presence, an overwhelming conviction that another being is standing nearby despite the complete absence of tangible evidence.

The phenomenon becomes even stranger when darkness enters the equation. Human vision is remarkably dependent upon light and context, and when information becomes scarce, the brain begins filling the gaps with assumptions. A coat hanging in a corner may become a motionless figure. A reflection may resemble a pair of watching eyes. An indistinct shadow may suddenly appear to possess a shape that feels unmistakably human.

This tendency is closely related to pareidolia, the neurological phenomenon in which the brain interprets meaningless patterns as familiar forms. It is the reason humanity has discovered faces within clouds, figures within shadows, and expressions upon lifeless objects.

The unsettling part is that none of these things need to exist for us to perceive them.
The brain does not always show us what is there.
Sometimes, it shows us what it believes should be there.

And when the mind becomes convinced that something is watching you, logic alone may not be enough to convince it otherwise.`,
  },

  back: {
    badge: '#3',
    title: 'THE BODY DOES NOT DIE ALL AT ONCE',
    text: `Death is commonly imagined as a singular moment, an invisible boundary separating the living from the dead. In reality, the biological process is considerably more gradual. When the heart ceases to beat and circulation stops, the body does not immediately become an inert object. Different cells and tissues possess different tolerances to the absence of oxygen, meaning that some may continue functioning for a limited period even after the body's primary systems have failed.

As oxygen disappears, however, the delicate machinery that sustains life begins to collapse. Cells lose their ability to maintain internal balance, tissues deteriorate, and organs gradually succumb to irreversible damage. What was once an intricate system of coordinated biological processes becomes increasingly disordered.

Then decomposition begins.

Microorganisms that inhabited the body during life begin breaking down its tissues. Enzymes digest cells from within, bacteria multiply without the immune system to restrain them, and gases accumulate as organic matter is gradually dismantled. The skin changes, the organs deteriorate, and the physical structure that once carried a person's identity slowly begins to disappear.

There is something deeply unsettling about this transformation.
The body that once laughed, spoke, loved, feared, and carried memories eventually becomes indistinguishable from the biological matter surrounding it.

Death does not simply stop the body.
It begins the process of taking it apart.`,
  },

  top: {
    badge: '#4',
    title: 'THE BRAIN MAY REMAIN ACTIVE AFTER THE BODY DIES',
    text: `The human brain is perhaps the most mysterious structure within the body, and even death does not make its final moments entirely comprehensible. When the heart stops, blood can no longer circulate oxygen throughout the body, yet the disappearance of brain activity is not necessarily instantaneous. Under certain circumstances, electrical activity may persist briefly after circulation has ceased.

What this activity actually represents remains a far more complicated question.

Scientific observation can detect electrical signals, chemical reactions, and changes occurring within neural tissue, but none of these measurements can conclusively tell us what a person experiences during the final moments of consciousness. Whether such activity corresponds to awareness, fragmented perception, or nothing resembling conscious experience at all remains uncertain.

This uncertainty is what makes the subject so disturbing.

Imagine the possibility of a brief interval in which the body can no longer respond, the senses are collapsing, and the outside world is slowly disappearing, while the brain has not yet fallen completely silent.

There may be no movement. No voice. No visible reaction.

And yet, somewhere within that failing biological system, activity may still be occurring.

Does consciousness disappear the instant the heart stops?
Does the mind fade gradually, like a light becoming weaker in an empty room?
Or is there a final moment of awareness that humanity simply has no means of observing?

We do not know.

And perhaps the most unsettling aspect of death is not what we have discovered about it, but how much remains beyond our understanding.`,
  },

  closeup: {
    badge: '#5',
    title: 'THE BODY WILL RETURN TO THE WORLD',
    text: `No matter how carefully a human body is preserved, protected, or admired during life, it ultimately becomes subject to the same indifferent biological process. After death, the structures that once maintained the body begin to collapse, and the matter within it gradually returns to the environment from which it originally came.

Water leaves the tissues and returns to the surrounding ecosystem. Carbon and other elements are released through decomposition. Organic compounds are consumed by microorganisms and transformed into substances that can once again become part of soil, plants, animals, and countless other forms of life.

The body does not simply disappear. It is redistributed.

The hands that once held another person's hand eventually become nothing more than matter. The eyes that once witnessed the world lose their ability to perceive it. The heart that once carried emotion becomes another organ returned to the earth.

Even the physical structure that made someone recognizable as an individual eventually disappears.

A name cannot stop decomposition.
Wealth cannot preserve it forever.
Beauty cannot negotiate with it.
And memory cannot prevent the body from returning to nature.

Perhaps that is the most unsettling truth of all.
Everything we spend our lives calling "me" is temporary.

The face. The flesh. The bones. The identity attached to them.

Eventually, all of it becomes indistinguishable from the world around us.

Death does not erase matter. It simply takes away the identity that once belonged to it.

In the end, every human body shares the same destination: To return to the world... and become part of something else.`,
  },
};

export class TypewriterManager {
  constructor() {
    this.container = document.getElementById('typewriter-container');
    this.badgeEl = document.getElementById('typewriter-badge');
    this.titleEl = document.getElementById('typewriter-title');
    this.textEl = document.getElementById('typewriter-text');
    this.cursorEl = document.getElementById('typewriter-cursor');

    this.timer = null;
    this.exitTimeout = null;
    this.currentPreset = null;
    this.isTyping = false;
    this.typingSpeed = 4;

    this._bindContainerTapDismiss();
  }

  _bindContainerTapDismiss() {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      e.stopPropagation();

      if (this.container.classList.contains('visible')) {
        this.hide();
      }
    });
  }

  hide() {
    this.clearTimers();
    this.currentPreset = null;
    this.isTyping = false;

    if (!this.container) return;

    this.container.classList.remove('is-typing', 'glitch-hit');

    if (this.container.classList.contains('visible')) {
      this.container.classList.add('exiting');
      this.container.classList.remove('visible');

      this.exitTimeout = setTimeout(() => {
        this.container.classList.remove('exiting');
        if (this.badgeEl) this.badgeEl.textContent = '';
        if (this.titleEl) this.titleEl.textContent = '';
        if (this.textEl) this.textEl.textContent = '';
      }, 250);
    } else {
      this.container.classList.remove('exiting');
      if (this.badgeEl) this.badgeEl.textContent = '';
      if (this.titleEl) this.titleEl.textContent = '';
      if (this.textEl) this.textEl.textContent = '';
    }
  }

  showPreset(presetName) {
    this.clearTimers();

    const data = PRESET_TEXT_DATA[presetName];
    if (!data || !this.container) {
      this.hide();
      return;
    }

    this.currentPreset = presetName;

    this.container.classList.remove('exiting', 'glitch-hit');
    if (this.container.scrollTop !== undefined) {
      this.container.scrollTop = 0;
    }

    if (this.badgeEl) this.badgeEl.textContent = data.badge;
    if (this.titleEl) this.titleEl.textContent = data.title;
    if (this.textEl) this.textEl.textContent = '';

    this.container.classList.add('visible', 'is-typing');

    const fullText = (data.text || '')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/^\n+/, '')
      .trim();
    let charIndex = 0;
    this.isTyping = true;

    if (this.cursorEl) {
      this.cursorEl.style.display = 'inline-block';
    }

    this.timer = setInterval(() => {
      if (charIndex < fullText.length) {
        this.textEl.textContent += fullText.charAt(charIndex);
        charIndex++;

        if (this.container.scrollHeight > this.container.clientHeight) {
          this.container.scrollTop = this.container.scrollHeight;
        }

        if (Math.random() < 0.12) {
          this.container.classList.add('glitch-hit');
          setTimeout(() => {
            if (this.container) {
              this.container.classList.remove('glitch-hit');
            }
          }, 40);
        }
      } else {
        this.isTyping = false;
        this.container.classList.remove('is-typing', 'glitch-hit');
        clearInterval(this.timer);
        this.timer = null;
      }
    }, this.typingSpeed);
  }

  clearTimers() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.exitTimeout) {
      clearTimeout(this.exitTimeout);
      this.exitTimeout = null;
    }
  }
}
