import { Button } from "../components/ui/button";

type Props = {
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  isLoading?: boolean;
};

export default function FormActions({
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  isLoading = false,
}: Props) {
  return (
    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
           <Button
        onClick={onSave}
        disabled={isLoading}
        className="px-6 rounded-full  btn-theme-save"
       
      >
        {isLoading ? "Saving..." : saveText}
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        className="px-6 rounded-full btn-theme-reject"
      >
        {cancelText}
      </Button>

   
    </div>
  );
}