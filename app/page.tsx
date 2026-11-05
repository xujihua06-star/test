import { Suspense } from "react";
import Home from "./home";
import { AccountLinks, GuestLinks } from "./account/links";

export default function Page() {
  return <Home account={<Suspense fallback={<GuestLinks />}><AccountLinks /></Suspense>} />;
}
