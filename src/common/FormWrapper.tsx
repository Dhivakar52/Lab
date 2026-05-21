"use client";

import type { ReactNode } from "react";
import { Card } from "../components/ui/card";
import FormActions from "../common/FormActions";
import BackButton from "../common/BackButton";

export default function FormWrapper({
  title,
  children,
  onSubmit,
  onCancel,
  // isValid = true,
  columns = 3,
}: {
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  onCancel?: () => void;
  isValid?: boolean;
  columns?: number;
}) {
  return (
    <Card className="border-0 m-[30px]  bg-white/80 ">
      <div className="p-6 space-y-6">
        <BackButton />

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>
        </div>

        {/* Dynamic Fields */}
        <div className={`grid grid-cols-${columns} gap-4`}>
          {children}
        </div>

        {/* Actions */}
        <FormActions
          onSave={onSubmit}
          onCancel={onCancel || (() => console.log("Cancelled"))}
         
        />
      </div>
    </Card>
  );
}