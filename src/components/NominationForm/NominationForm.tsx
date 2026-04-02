

 import * as Tabs from '@radix-ui/react-tabs';
// import {  useNavigate } from "react-router-dom";
import SelfNominationComponent from '../SelfNomination/SelfNominationComponent'
import OtherNominationForm from './OtherNominationForm';




const NominationComponent = () => {
    // const [activeTab, setActiveTab] = React.useState<'my' | 'others'>('my');

    //const navigate=useNavigate();

    // const handleForm=()=>{
    //  navigate("add-nomination");
    // }
  return (
    <div className='p-6 shadow-sm bg-white rounded-lg'>
       <div className=" border-b border-gray-200 mb-6 lg:mb-8 overflow-x-auto">
                 <Tabs.Root defaultValue="table" className="">
        {/* Tab Buttons */}
        <Tabs.List className="flex md:w-[40%] sm:w-[50%] border-b border-gray-300 mb-4">
          <Tabs.Trigger
            value="table"
            className="flex-1 text-sm px-4 py-2 text-center data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 hover:bg-gray-100"
          >
           Self Nomination 
          </Tabs.Trigger>
          <Tabs.Trigger
            value="form"
            className="flex-1 text-sm px-4 py-2 text-center data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 hover:bg-gray-100"
          >
            Other Nomination
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab Panels */}
        <div>
<Tabs.Content value="table" >
  {/* <div className='flex justify-end items-baseline'>
     <button className="bg-[#08805E] text-white rounded-sm px-3 py-1 me-3" onClick={handleForm}>Add Nomination</button>
     <FilterComponent/>
  </div> */}
           
         <SelfNominationComponent/>
        </Tabs.Content>

        <Tabs.Content value="form" >
          
        <OtherNominationForm/>
        </Tabs.Content>
        </div>
        
      </Tabs.Root>
              </div>
  
              {/* Table */}
            
    </div>
  )
}

export default NominationComponent
