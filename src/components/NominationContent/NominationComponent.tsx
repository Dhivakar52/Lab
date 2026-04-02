
import NominationTable from './NominationTable';
import * as Tabs from '@radix-ui/react-tabs';
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import OtherNominationTable from "./OtherNominationTable"


const NominationComponent = () => {
    // const [activeTab, setActiveTab] = React.useState<'my' | 'others'>('my');
    const location = useLocation();
    const navigate=useNavigate();
    const [tab, setTab] = React.useState("table");

    useEffect(() => {
  if (location.state?.tab) {
    setTab(location.state.tab);
  }
}, [location.state]);
  return (
    <div className='p-6 shadow-sm bg-white rounded-lg'>
       <div className=" border-b border-gray-200 mb-6 lg:mb-8 overflow-x-auto">
                 {/* <Tabs.Root defaultValue="table" className="">  */}
            <Tabs.Root value={tab} onValueChange={setTab}>
        {/* Tab Buttons */}
        <Tabs.List className="flex md:w-[40%] sm:w-[50%] border-b border-gray-300 mb-4">
          <Tabs.Trigger
            value="table"
            className="flex-1 text-sm px-4 py-2 text-center data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 hover:bg-gray-100"
          >
           My Nominations
          </Tabs.Trigger>
          <Tabs.Trigger
            value="form"
            className="flex-1 text-sm px-4 py-2 text-center data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 hover:bg-gray-100"
>
           Nominated By Me
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab Panels */}
        <div>

 
 {/* <Tabs.Content value="table" >  */}
<Tabs.Content value="table">
  {/* <NominationTable refresh={refreshFlag} /> */}
           <NominationTable  /> 
        </Tabs.Content>

        <Tabs.Content value="form" >
            {/* <FilterComponent/> */}
                     <div>

          </div>
        <OtherNominationTable  />
        </Tabs.Content>
        </div>
        
      </Tabs.Root>
              </div>
  
              {/* Table */}
            
    </div>
  )
}

export default NominationComponent
