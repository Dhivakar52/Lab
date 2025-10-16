import React from "react";

interface Notification {
  title: string;
  message: string;
  time: string;
  type: "Referral Request" | "New Referral Request" | "Nomination Approval Required" | "Nomination Approved";
}

const notifications: Notification[] = [
  {
    title: "Referral Request",
    message: "Vijay Kumar has requested your referral for the Innovation category.",
    time: "2 minutes ago",
    type: "Referral Request",
  },
  {
    title: "New Referral Request",
    message: "You have a new referral request from Karthik for UI/UX category.",
    time: "10 minutes ago",
    type: "New Referral Request",
  },
  {
    title: "Nomination Approval Required",
    message: "You need to approve a nomination for Vijay Kumar in Innovation category.",
    time: "1 hour ago",
    type: "Nomination Approval Required",
  },
  {
    title: "Nomination Approved",
    message: "Your nomination for Vijay Kumar (Innovation) has been approved by the Manager.",
    time: "2 hours ago",
    type: "Nomination Approved",
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "Referral Request":
      return "bg-blue-100 text-blue-700";
    case "New Referral Request":
      return "bg-purple-100 text-purple-700";
    case "Nomination Approval Required":
      return "bg-yellow-100 text-yellow-700";
    case "Nomination Approved":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const NotificationTable: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden m-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {notifications.map((note, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      note.type
                    )}`}
                  >
                    {note.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{note.message}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{note.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationTable;
