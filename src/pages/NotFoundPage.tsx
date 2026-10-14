import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-5 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-5xl">This page is not in the collection.</h1>
      <p className="mt-4 text-mist">The link may be out of date. Return to the home page to continue exploring.</p>
      <Link to="/" className="btn-gold mt-10">Back to home</Link>
    </div>
  );
}
