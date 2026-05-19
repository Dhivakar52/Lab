import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Label } from "../../ui/label";

export default function WorkflowForm({ setFormData }: any) {
  return (
    <div>
      <Label>QA Required</Label>
      <Select onValueChange={(v) => setFormData((p: any) => ({ ...p, qaRequired: v }))}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Yes">Yes</SelectItem>
          <SelectItem value="No">No</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}