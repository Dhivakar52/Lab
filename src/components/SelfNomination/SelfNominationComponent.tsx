import * as Label from "@radix-ui/react-label";
// import * as Select from "@radix-ui/react-select";
import { useState } from "react";
import { Outlet } from "react-router-dom";


export default function AddNomination() {
  const [referrals, setReferrals] = useState([
    "sathishkumar312@srm.com",
    "kumaran@srm.com",
    "manikandan@srm.com",
  ]);

  const addReferral = () => setReferrals([...referrals, ""]);
  const updateReferral = (i: number, value: string) => {
    const updated = [...referrals];
    updated[i] = value;
    setReferrals(updated);
  };
  const removeReferral = (i: number) => {
    const updated = referrals.filter((_, idx) => idx !== i);
    setReferrals(updated);
  };

  return (
    <div className="p-5">
        <form className="p-6 border rounded-lg bg-white shadow nominate-form">
        <h2 className="text-xl font-semibold mb-6">Self Nominate Form</h2>

        {/* Title of Submission */}
        <div className="mb-4">
          <Label.Root htmlFor="title" className="block text-sm font-medium">
            Title of Submission
          </Label.Root>
          <input
            id="title"
            type="text"
            placeholder="Best Innovation"
            className="w-full mt-1 border rounded px-3 py-2"
          />
        </div>

        {/* Nominee Name & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label.Root className="block text-sm font-medium">
              Nominee Name
            </Label.Root>
            <input
              type="text"
              placeholder="Ravi Kumar"
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label.Root className="block text-sm font-medium">
              Department
            </Label.Root>
            <input
              type="text"
              placeholder="Research & Innovation"
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Email ID & Mobile Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label.Root className="block text-sm font-medium">Email ID</Label.Root>
            <input
              type="email"
              placeholder="ravikumar381@srm.com"
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label.Root className="block text-sm font-medium">
              Mobile Number
            </Label.Root>
            <input
              type="tel"
              placeholder="+91 98456 87321"
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Manager Email */}
        <div className="mb-2">
          <Label.Root className="block text-sm font-medium">
            Manager Email ID
          </Label.Root>
          <input
            type="email"
            placeholder="prasath16@srm.com"
            className="w-full mt-1 border rounded px-3 py-2 mb-3"
          />
         <div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Contest Type
  </label>
  <select
    name="contestType"
    // value={form.contestType}
    // onChange={handleChange}
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: "right 0.5rem center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "1.5em 1.5em",
      paddingRight: "2.5rem",
    }}
  >
    <option value="">Select Contest Type</option>
    <option value="innovation">Innovation</option>
    <option value="service">Service Excellence</option>
    <option value="talent">Talent</option>
    <option value="leadership">Leadership</option>
  </select>
</div>

        </div>

        {/* Referrals */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">
            Referrals Email ID <span className="text-red-500">(mandatory 3*)</span>
          </Label.Root>
          {referrals.map((ref, i) => (
            <div key={i} className="flex items-center mt-2">
              <input
                type="email"
                value={ref}
                onChange={(e) => updateReferral(i, e.target.value)}
                className="flex-1 border rounded px-3 py-2 mr-2"
              />
              {referrals.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeReferral(i)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addReferral}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
          >
            Add More
          </button>
        </div>
          </div>

       

        {/* Contest Type */}
       

        {/* Supporting Documents */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">
            Supporting documents
          </Label.Root>
          <input type="file" className="mt-1 border p-2 rounded w-full" />
        </div>

        {/* Description */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">
            Description
          </Label.Root>
          <textarea
            placeholder="Describe your submission..."
            className="w-full mt-1 border rounded px-3 py-2 h-28 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 btn-theme"
          >
            Submit Nomination
          </button>
        </div>
      </form>
      <Outlet />
    </div>
  );
}
