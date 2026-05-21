"use client";

import { useState } from "react";
import FormWrapper from "../../../common/FormWrapper";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";

export default function VisitForm() {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Visit Data 👉", formData);
  };

  return (
    <FormWrapper
      title="Add Site Registration"
      onSubmit={handleSubmit}
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

                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="bg-white border z-50"
                >
                  <SelectItem value="SC001">SC001</SelectItem>
                  <SelectItem value="SC002">SC002</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Site Code */}
            <div className="space-y-2">
              <Label>Site Code *</Label>
              <Input
                onChange={(e) =>
                  handleChange("siteCode", e.target.value)
                }
              />
            </div>

            {/* Site Type */}
            <div className="space-y-2">
              <Label>Site Type *</Label>
              <Select
                value={formData.siteType || ""}
                onValueChange={(v) => handleChange("siteType", v)}
              >
                <SelectTrigger className="w-full bg-white border">
                  <SelectValue placeholder="Select Site Type" />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="bg-white border z-50"
                >
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Site Name */}
            <div className="space-y-2">
              <Label>Site Name *</Label>
              <Input
                onChange={(e) =>
                  handleChange("siteName", e.target.value)
                }
              />
            </div>

            {/* Site Address */}
            <div className="space-y-2">
              <Label>Site Address *</Label>
              <Input
                onChange={(e) =>
                  handleChange("siteAddress", e.target.value)
                }
              />
            </div>

            {/* Investigator */}
            <div className="space-y-2">
              <Label>Investigator *</Label>
              <Input
                onChange={(e) =>
                  handleChange("investigator", e.target.value)
                }
              />
            </div>

         
    </FormWrapper>
  );
}