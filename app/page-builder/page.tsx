'use client'

import { Suspense } from "react";
import PageBuilder from "./pagebuilder";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageBuilder />
    </Suspense>
  );
}
