import { DashboardComponent } from "./Dashboard";
import one from '../assets/outputnew.png'
import two from '../assets/outputN.png'
import three from '../assets/output2.png'
import four from '../assets/output3.png'


export function AnalysisComponent(){

    return(
        <>
            <div style={{
                display: 'grid',          
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gridTemplateRows: 'repeat(2, 1fr)',    
                gap: '50px',              
                justifyItems: 'center',   
                alignItems: 'center'      
            }}>
                <img src={one} alt="Image One" style={{height: 370, width: 370}}/>
                <img src={two} alt="Image Two" style={{height: 370, width: 370}}/>
                <img src={three} alt="Image Three" style={{height: 370, width: 370}} />
                <img src={four} alt="Image Four" style={{height: 370, width: 370}}/>
            </div>
        </>
    )

}