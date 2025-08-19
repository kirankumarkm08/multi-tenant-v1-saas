// app/contact/page.tsx
import { Suspense } from "react";
import ContactPageClient from "./ClientContactPage";

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactPageClient />
    </Suspense>
  );
}
