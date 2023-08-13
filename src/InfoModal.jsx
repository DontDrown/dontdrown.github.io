import ReactModal from "react-modal"


const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width:'60%',
      height:'50%'
    },
  };

const InfoModal = ({modalState,setModalState}) => {
    if(modalState == "prepare")
    {
        return(
            <ReactModal isOpen = {true} style = {modalStyles}>
            <div className='modalContainer'>
                <div style={{flexDirection:'row',display:'flex'}}> <h2 style={{flex:1}}>Flood Preperation</h2> <div><h2 style ={{cursor:"pointer"}}onClick={()=>setModalState("closed")}>X</h2></div></div>
             
              <p>The flood is dangerous if</p>
              <ul>
                <li>Water is very deep or travelling very fast</li>
                <li>Floodwaters have risen very quickly</li>
                <li>Floodwater contains debris, such as trees or building </li>
              </ul>
                <p><strong>Before</strong></p>
                <p>If you find your home or property lies within an area that may be
    affected by flooding, you can take some steps to help protect 
    yourself and your belongings.</p>
    <p>Check the Auckland's Hazards Viewer to find out if you live, work
    or play in an area prone to flooding
    Decide what to do if access to your house is cut off or if your 
    house is at risk of flooding, plan to evacuate. If your house is not 
    flooded, it might be better to stay at home
    Make a plan, including planning and practicing evacuation 
    routes. The plan should show you the safest routes to higher 
    ground or to your community’s place of safety. If you live in a 
    flash flood area you should have several alternative routes. All 
    members of the household should know where to meet each 
    other, where to evacuate to, and what route(s) to take if you 
    have to leave
    If you rent your property, ensure you take responsibility for 
    informing guests of the relevant risks on what to do and how to 
    stay safe.<br/>
    If flooding is expected, enlist some helpful friends to help you 
    move your furniture upstairs
    Bring outdoor belongings such as patio furniture, indoors
    If flooding is expected, consider using sandbags to keep water 
    away from your home.</p>
    <p><strong>During</strong></p>
                    <p>During an event listen to the radio and follow the instructions of 
    emergency services.<br/>
    Be prepared to evacuate quickly if it becomes necessary, follow 
    your emergency plan, take your emergency bag and pets with 
    you if it is safe to do so.<br/>
    Surface flooding, restricted visibility and slips are possible during
    severe weather; avoid driving unless absolutely necessary
    Be aware that cars, caravans and tree branches float and can 
    become flood debris that causes damage
    <br/> Do not try to walk or drive through floodwater
    Move valuable or dangerous items as high as you can off the 
    floor or out of the flood zone.
    After</p>
    <p><strong>After</strong></p>
    <p>After a flood ensure you're safe to return home (if you've left). 
    Here are some things you might consider:</p>
    <ul>
        <li>Start clearing out and drying your home when rain stops 
    and water recedes</li>
    <li>Floodwater may be contaminated, throw away any food 
    and drink that may have been in contact with floodwater 
    including canned goods</li>
    <li>Clean up carefully and take care around remaining 
    floodwater</li>
    <li>Take photos for your insurer of any items you throw away</li>
    
    </ul>
            </div>
            
          </ReactModal>
        )
    }
    else if(modalState == "contact")
    {
        return(
            <ReactModal isOpen = {true} style = {modalStyles}>
            <div className='modalContainer'>
                <div style={{flexDirection:'row',display:'flex'}}> <h2 style={{flex:1}}>Emergency Contacts</h2> <div><h2 style ={{cursor:"pointer"}}onClick={()=>setModalState("closed")}>X</h2></div></div>
                


                <a href="https://www.aucklandcouncil.govt.nz/environment/looking-after-aucklands-water/flooding-blockages/Pages/what-to-do-in-a-flooding-emergency.aspx">What to do in a flooding emergency<br/></a>
                <a href="https://www.aucklandcouncil.govt.nz/environment/looking-after-aucklands-water/flooding-blockages/Pages/prevent-flooding-blockages-on-property.aspx">How to report flooding or flood risks<br/></a>
                <a href="https://www.aucklandcouncil.govt.nz/environment/looking-after-aucklands-water/flooding-blockages/Pages/recovering-after-flood.aspx">What to do in a flooding emergency</a>
            </div>
            
          </ReactModal>
        )
    }
    
}
export default InfoModal