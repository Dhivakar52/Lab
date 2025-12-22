
import { ArrowLeft } from "lucide-react";

export default function BackToSetting() {


  const handleBackward = () => {
    window.history.back();
  }

  return (
    <>
    <div  className='p-2'>

  <button onClick={handleBackward} className="flex items-center text-blue-600 bg-white border-gray-100 rounded-sm px-2 py-1   font-medium"> <span className="me-2"><ArrowLeft size={14}/></span> Back</button>
       </div>
    </>
  );
}
