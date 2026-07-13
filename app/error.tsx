"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="foundation-shell" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1>Youtoola could not load this page.</h1>
      <p className="lede">Try the request again.</p>
      <button className="button button--primary" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
