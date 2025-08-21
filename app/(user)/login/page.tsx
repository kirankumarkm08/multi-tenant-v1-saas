// app/contact/page.tsx
import { Suspense } from "react";
import ClientLoginPage from "./ClientLoginPage";

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientLoginPage />
    </Suspense>
  );
}
