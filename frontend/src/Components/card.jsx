import waywire from '../assets/waywire.png'
// import linkedin from '../assets/linkedin.png'
import facebook from '../assets/facebook.png'
import twitter from '../assets/twitter.png'
import crunchbase from '../assets/crunchbase.png'

export function CardComponent(){
    return(
        <>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            </style>

            <div style={{height: 490, width: 280, backgroundColor: 'rgba(255, 255, 182, 0.4)', fontFamily: 'Elms Sans', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                <img src={waywire} alt="" style={{height: 130, width: 130}}/>
                <p style={{fontSize: 30}}>WayWire</p>
                <p>Founded: 2013</p>
                <p>Team Size: 8300</p>
                <p>Status: Public</p>
                <p>Location: New York</p>

                <div style={{display: 'flex', gap: 10}}>
                    {/* <a href="https://www.linkedin.com/feed/"><img src={linkedin} alt=""  style={{height: 40, width: 40}}/></a> */}
                    <a href="https://x.com/home"><img src={twitter} alt=""  style={{height: 40, width: 40}}/></a>
                    <a href="https://www.facebook.com/waywire/"><img src={facebook} alt=""  style={{height: 40, width: 50}}/></a>
                    <a href="https://www.crunchbase.com/organization/waywire"><img src={crunchbase} alt=""  style={{height: 40, width: 40}}/></a>
                </div>
            </div>
        </>
    )
}

