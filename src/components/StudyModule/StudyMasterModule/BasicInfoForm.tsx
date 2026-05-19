import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";

export default function BasicInfoForm({ setFormData }: any) {
  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">BASIC INFORMATION</h2>

      {/* 3 COLUMN GRID */}
      <div className="grid grid-cols-3 gap-4">

        {/* Study Code */}
        <div className="space-y-2">
          <Label>Study Code *</Label>
          <Input value="Auto Generated" disabled />
        </div>

        {/* Protocol Number */}
        <div className="space-y-2">
          <Label>Protocol Number *</Label>
          <Input onChange={(e) => handleChange("protocolNumber", e.target.value)} />
        </div>

        {/* Protocol Title */}
        <div className="space-y-2">
          <Label>Protocol Title *</Label>
          <Input onChange={(e) => handleChange("protocolTitle", e.target.value)} />
        </div>

        {/* Sponsor Name */}
        <div className="space-y-2">
          <Label>Sponsor Name *</Label>
          <Input onChange={(e) => handleChange("sponsorName", e.target.value)} />
        </div>

        {/* CRO Name */}
        <div className="space-y-2">
          <Label>CRO Name</Label>
          <Input onChange={(e) => handleChange("croName", e.target.value)} />
        </div>

        {/* Study Type */}
        <div className="space-y-2">
          <Label>Study Type *</Label>
          <Select onValueChange={(v) => handleChange("studyType", v)}>
            <SelectTrigger className="w-full bg-white border">
              <SelectValue placeholder="Select Study Type" />
            </SelectTrigger>

            <SelectContent
              side="bottom"
              align="start"
              position="popper"
              sideOffset={4}
              className="min-w-[var(--radix-select-trigger-width)] z-50 bg-white border"
            >
              <SelectItem value="Interventional" className="hover:bg-gray-100">
                Interventional
              </SelectItem>
              <SelectItem value="Observational" className="hover:bg-gray-100">
                Observational
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Study Phase */}
        <div className="space-y-2">
          <Label>Study Phase</Label>
          <Select onValueChange={(v) => handleChange("studyPhase", v)}>
            <SelectTrigger className="w-full bg-white border">
              <SelectValue placeholder="Select Phase" />
            </SelectTrigger>

            <SelectContent
              side="bottom"
              align="start"
              position="popper"
              className="bg-white border"
            >
              <SelectItem value="I">Phase I</SelectItem>
              <SelectItem value="II">Phase II</SelectItem>
              <SelectItem value="III">Phase III</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Principal Investigator */}
        <div className="space-y-2">
          <Label>Principal Investigator</Label>
          <Input onChange={(e) => handleChange("principalInvestigator", e.target.value)} />
        </div>

        {/* Study Status */}
        <div className="space-y-2">
          <Label>Study Status</Label>
          <Select onValueChange={(v) => handleChange("studyStatus", v)}>
            <SelectTrigger className="w-full bg-white border">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>

            <SelectContent
              side="bottom"
              align="start"
              position="popper"
              className="bg-white border"
            >
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}