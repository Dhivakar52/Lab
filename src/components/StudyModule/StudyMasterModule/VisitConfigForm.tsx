import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export default function VisitConfigForm({ setFormData }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Visit Template</Label>
        <Input onChange={(e) => setFormData((p: any) => ({ ...p, visitTemplate: e.target.value }))} />
      </div>
    </div>
  );
}