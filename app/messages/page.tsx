import { MessagePreview } from "@/components/MessagePreview";
import { Suspense } from "react";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Chargement de la sélection...</div>}>
      <MessagePreview />
    </Suspense>
  );
}
