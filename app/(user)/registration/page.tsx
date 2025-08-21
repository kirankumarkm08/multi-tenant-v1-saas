'use client '
import { Suspense } from "react";
import ClientRegistrationPage from "./register";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientRegistrationPage />
    </Suspense>
  );
}
