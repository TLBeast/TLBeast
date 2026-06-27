import type { Metadata } from "next";
import Link from "next/link";
import { WeekendWipeoutIntro } from "@/components/WeekendWipeoutIntro";

export const metadata: Metadata = {
  title: "Weekend Wipeout",
  description:
    "An initiative to wipe out toxic gatekeeping in tech — LeetCode culture, elitist hiring, and the rat race that keeps people out.",
};

export default function WeekendWipeoutPage() {
  return (
    <WeekendWipeoutIntro>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-sm uppercase tracking-widest text-[var(--color-accent-dim)]">
          Troll Post :D
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
          Linkedln CopyPasta Post of the Century?
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
          <p>
            Do you identify as a D1 LARPer? Do you struggle from frequent visions
            of becoming the next big thing but have no desire to actually do
            anything? Do you find yourself doomscrolling social media? Do you get
            zero motion in your life (especially on Linkedln) while constantly
            stalking every soul that gets into YC? Well I&apos;ve got the perfect
            solution for you!
          </p>

          <p>
            Just CTRL + C what you see below, CTRL + V, make the post, and
            together, let&apos;s make Linkedln great again 🥴?!
          </p>

          <p>
            There are parts of tech culture I have a real problem with. Elite
            big-tech corporate culture annoys me more than I can easily put into
            words. The entry-level CS job market is tragically broken and toxic.
          </p>

          <p className="text-[var(--color-text)]">
            LeetCode and system design interviews in 2026? Are we serious?
          </p>

          <p>
            I&apos;m here to wipe this out for good. The line is that only
            top-tier college grads and seasoned software architects belong — that
            an entry-level developer who can use AI well has no right to enter the
            field?
          </p>

          <p>
            Are we stuck grinding out thousands of job apps, investing our soul
            into interview prep, &ldquo;performing&rdquo; on LinkedIn and chasing
            startup hype — move to SF, optimize for liquidation from day one?
          </p>

          <p>
            Here&apos;s what I believe: it&apos;s a human right to wake up and do
            what you love, what you&apos;re best at, what lets you offer authentic
            value — without being trapped in society&apos;s approval echo chamber
            that seeps into every corner of our lives.
          </p>

          <p>
            So let&apos;s max out AI to its fullest potential. Everyone deserves
            their own system design, DSA, OAs, take-home projects, and whatever
            other nonsense you want to mentally add to this list — all in their
            mental back pocket.
          </p>

          <p>
            We need to bring about a revolutionary level of clarity and break this
            content down to a degree where a sleeping toddler could understand it.
            The next time someone even utters the words &ldquo;interview prep,&rdquo;
            it should be as simple as pointing in a direction.
          </p>

          <p>
            I want the most gatekept, elitist parts of tech hiring to become a
            running joke. I want a world where a school teacher — because I love
            teachers — is respected more than a principal engineer at Amazon,
            Google, or Meta. These companies don&apos;t get to brainwash us into
            thinking the people who work there are better than everyone else. They
            don&apos;t get to run a toxic rat race of five million interview
            rounds just to get rejected.
          </p>

          <p>
            You might be asking: well, if we did that, wouldn&apos;t these
            companies come up with new ways to hire? How would hiring even work?
            How do people find jobs and support families?
          </p>

          <p>
            <span className="text-[var(--color-text)]">My answer:</span> it all
            comes back down to the glory of demystifying the stuff I talked about
            in my{" "}
            <Link href="/about/" className="text-[var(--color-accent)] hover:underline">
              About Me
            </Link>
            .
          </p>
        </div>

        <p className="mt-12 text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          It&apos;s over.
        </p>

        <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
          I&apos;m starting this initiative. Whoever wants to join me can join
          me.
        </p>
      </div>
    </WeekendWipeoutIntro>
  );
}
