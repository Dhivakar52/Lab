"use client";

import { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";

import FormWrapper from "../../../common/FormWrapper";

export default function AmendmentForm() {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Final Data 👉", formData);
  };

  // ✅ validation
  const requiredFields = [
    "studyCode",
    "protocolVersion",
    "effectiveDate",
    "amendmentCategory",
    "amendmentBy",
    "amendmentReason",
  ];

  const isFormValid = requiredFields.every(
    (field) => formData[field]
  );

  return (
    <FormWrapper
      title="Study Amendment"
      onSubmit={handleSubmit}
      isValid={isFormValid}
    >
      {/* Study Code */}
      <div className="space-y-2">
        <Label>Study Code *</Label>
        <Select
          value={formData.studyCode || ""}
          onValueChange={(v) => handleChange("studyCode", v)}
        >
          <SelectTrigger className="w-full bg-white border">
            <SelectValue placeholder="Select Study Code" />
          </SelectTrigger>

          <SelectContent className="bg-white border z-50">
            <SelectItem value="SC001">SC001</SelectItem>
            <SelectItem value="SC002">SC002</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Protocol Version */}
      <div className="space-y-2">
        <Label>New Protocol Version *</Label>
        <Input
          onChange={(e) =>
            handleChange("protocolVersion", e.target.value)
          }
        />
      </div>

      {/* Effective Date */}
      <div className="space-y-2">
        <Label>Effective Date *</Label>
        <Input
          type="date"
          onChange={(e) =>
            handleChange("effectiveDate", e.target.value)
          }
        />
      </div>

      {/* Amendment Category */}
      <div className="space-y-2">
        <Label>Amendment Category *</Label>
        <Select
          value={formData.amendmentCategory || ""}
          onValueChange={(v) =>
            handleChange("amendmentCategory", v)
          }
        >
          <SelectTrigger className="w-full bg-white border">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>

          <SelectContent className="bg-white border z-50">
            <SelectItem value="Major">Major</SelectItem>
            <SelectItem value="Minor">Minor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Study Status */}
      <div className="space-y-2">
        <Label>Study Status</Label>
        <Select
          defaultValue="Draft"
          onValueChange={(v) =>
            handleChange("studyStatus", v)
          }
        >
          <SelectTrigger className="w-full bg-white border">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>

          <SelectContent className="bg-white border z-50">
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Amendment By */}
      <div className="space-y-2">
        <Label>Amendment By *</Label>
        <Input
          onChange={(e) =>
            handleChange("amendmentBy", e.target.value)
          }
        />
      </div>

      {/* Amendment Reason */}
      <div className="space-y-2 col-span-3">
        <Label>Amendment Reason *</Label>
        <Input
          onChange={(e) =>
            handleChange("amendmentReason", e.target.value)
          }
        />
      </div>
    </FormWrapper>
  );
}