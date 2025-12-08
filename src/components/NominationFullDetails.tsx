import type React from "react";
import { useAuth } from "./ContextAPI/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import BackToSetting from "./BackToSetting";

const apiUrl = import.meta.env.VITE_API_URL;

const NominationFullDetails:React.FC = () => {
    const { nominationID } = useParams();  
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const { authToken, userId } = useAuth();


    useEffect(() => {
    const fetchNominations = async () => {
      try {
         const res = await axios.get(`${apiUrl}/api/nominationsbyuser`, {
        //   params: {
        //     UserID: userId,
        //   },
          headers: { Authorization: `Bearer ${authToken}`,},
        });
        const nominationIDAsNumber = Number(nominationID); 
        const nominationFilter = res.data.find((nom: any) => nom.NominationID === nominationIDAsNumber);  
        setData(nominationFilter);

    } catch (err) {
        console.error("❌ Error fetching nominations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNominations();
  }, []);


return (
<div className=" p-5">
   <BackToSetting/>
   <div className="bg-white rounded-lg shadow-lm border-gray-200 p-6">
         <h1 className="text-2xl font-semibold"> Nomination Details </h1>
         <br/>

            <div className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-3">
                <div className="space-y-1">
                  <div className="text-lm font-medium ">Nominee</div>
                  <div className="text-lm text-gray-600">{data.Nominee}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lm font-medium text-gray-900">Tenant</div>
                  <div className="text-lm text-gray-600">{data.Tenant}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lm font-medium text-gray-900">Category</div>
                  <div className="text-lm text-gray-600">{data.AwardCategory}</div>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-3">

                <div className="space-y-1">
                  <div className="text-lm font-medium text-gray-900">Nominated By</div>
                  <div className="text-lm text-gray-600">{data.NominatedBy}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lm font-medium text-gray-900">Submission Date</div>
                  <div className="text-lm text-gray-600">{data.SubmittedDate}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lm font-medium text-gray-900">Contest Type</div>
                  <div className="text-lm text-gray-600">{data.ContestType}</div>
                </div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-3">

                <div className="space-y-1">
                    <div className="text-lm font-medium text-gray-900">Status</div>
                    <div className="flex">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          data.Status === "Pending"
                            ? "bg-orange-100 text-orange-800"
                            : data.Status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : data.Status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : data.Status === "Under Review"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {data.Status}
                      </span>
                    </div>
                </div>
                <div className="space-y-1">
                  <div className="text-lm font-medium text-gray-900">Manager</div>
                  <div className="text-lm text-gray-600">{data.ManagerName}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lm font-medium text-gray-900">Manager Email ID</div>
                  <div className="text-lm text-gray-600">{data.ManagerEmailID}</div>
                </div>
              </div>

              <div className="text-lm font-medium text-gray-900 mb-1">Referrals</div>
              <div className="text-gray-600 space-y-1">
                {data["Referrals ID"]?.length ? (
                  data["Referrals ID"].map((ref: any, i:number) => (
                    <div key={i} >
                      <p className="text-lm">
                        <span className="font-semibold text-gray-800">{ref.ReferralName}</span>
                        <span className="px-2 text-gray-500">|</span>
                        <span className="text-gray-600">{ref.TenantName}</span>
                        <span className="px-2 text-gray-500">|</span>
                        <span className="font-semibold text-gray-600">{ref.DeptName}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-lm">No referral details available</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-lm font-medium text-gray-900">Description</div>
                <div className="text-lm text-gray-600">{data.Descriptions && data.Descriptions.trim() !== ""
                ? data.Descriptions : "No description provided"}</div>
              </div>
              {/* Supporting Documents */}
            <div>
            <div className="text-lm font-medium text-gray-900">Supporting Documents</div>
             <div className="mt-2 space-y-2">
               {data["Supporting Documents"]?.length ? (
                data["Supporting Documents"].map((doc:any, i:number) => (
               <a
               key={i}
               href={doc.FilePath}
               target="_blank"
               rel="noopener noreferrer"
              className="flex my-2 items-center gap-2 text-blue-600 hover:underline"
               >
              <FileText className="w-5 h-5 text-blue-600" />
              {doc.OriginalFileName}
             </a>
              ))
             ) : (
             <p className="text-gray-500 text-lm">No documents uploaded</p>
             )}
              </div>
             </div>
            </div>



   </div>

  </div>    


  )
}

export default NominationFullDetails;