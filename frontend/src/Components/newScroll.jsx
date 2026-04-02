import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, activeAnimations } from 'framer-motion';
import { ViewStartup } from './liststartups';

export const StartupText = ({ item, onBecomeActive, onLeave }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.1, 1, 0.1]);
    const scale = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.8, 1.2, 0.8]);

    return(
        <>
            <motion.div
                ref = {ref}
                onViewportEnter={onBecomeActive}
                onViewportLeave={onLeave}
                viewport={{amount: 0.5}}
                style={{ opacity, scale, height: "60vh", display: "flex", alignItems: "center", justifyContent: "center"}}>


                {item.name === "VALUATION" ? 
                    (
                    <div className='venture' style={{display: "flex" ,color: "#ff6600"}}>
                        <div id='startup-grid' style={{width: "100%"}}>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/twitch-logo-transparent-b8560e630f4d259e1c9fb3a84b26ffc5ff215fe3bb475d10c830e5239678008f.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/airbnb-logo-transparent-51af28d59ce97220921890c77b96fee285b06c09facec62a8678cac4e446718a.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/gusto-logo-transparent-dd645cd073cb1f896ea2ddc36927c3e75e02b71d7a9f1d470e18938056cba5ef.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/kalshi-logo-transparent-36e6c9f8ee1e946f00b6b14673c650a37861975e75d7b85f57393c67376bc273.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/scaleai-logo-transparent-0bfe7bf608b76a652394725da3ae8bac8bbf79eab414df52388e755bee9e8a6a.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/deel-logo-transparent-016c7a0ae619ae0d52d1c3306dc9658c1eb888ee8b92ec175cd0788ca7411d18.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/doordash-logo-transparent-04e06210d2557e90b9dd0617712d2e47cd0506a5ab327a19ba367976e5cb828e.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/ironclad-logo-transparent-0d5f5cdbd3dcecaf95d1aef019a5ebee3122d169eaa68cec9258d6ead676eeff.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/posthog-logo-transparent-b066a8e28cc4bf30df2a8acb15871d6f78c0d4068c5b061656ab36f4594c582f.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/openai-logo-transparent-c650fb6bfd7073c21245510b8860f3d3d72fcf7a1ca3deed267af5a97f24616e.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/coinbase-logo-transparent-884b707305fbf3cc64e2fd880312ac0e30310b68b831c61bc47446daec352d28.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/instacart-logo-transparent-bd83ae5639098d164490c7c243fd295a25e8a54b3db1404d3c1a1242c3daaf11.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/faire-logo-transparent-5c0990582c0111c1bf5066c1b05c2081635e2d240633bf65cdd27b74a633c501.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/stripe-logo-transparent-85c767ab1ed5ba6d984910431da37aa11f0e491bbb5893620aeb9139112bc870.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/rippling-logo-transparent-491cdc4a31bbb5e0accd6699f3f3e38e1c8990b002db2dca9ee9c060a58b667f.png" alt="" style={{height: "12vh"}}/>
                        </div>
                        <center>
                            <h1>$1.3 Trillion</h1>
                            <br />
                            <i style={{fontSize: "16px", lineHeight: "24px", fontWeight: 350}}>Combined Valuation</i>
                        </center>
                        <div id='startup-grid' style={{width: "100%"}}>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/twitch-logo-transparent-b8560e630f4d259e1c9fb3a84b26ffc5ff215fe3bb475d10c830e5239678008f.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/airbnb-logo-transparent-51af28d59ce97220921890c77b96fee285b06c09facec62a8678cac4e446718a.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/gusto-logo-transparent-dd645cd073cb1f896ea2ddc36927c3e75e02b71d7a9f1d470e18938056cba5ef.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/kalshi-logo-transparent-36e6c9f8ee1e946f00b6b14673c650a37861975e75d7b85f57393c67376bc273.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/scaleai-logo-transparent-0bfe7bf608b76a652394725da3ae8bac8bbf79eab414df52388e755bee9e8a6a.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/deel-logo-transparent-016c7a0ae619ae0d52d1c3306dc9658c1eb888ee8b92ec175cd0788ca7411d18.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/doordash-logo-transparent-04e06210d2557e90b9dd0617712d2e47cd0506a5ab327a19ba367976e5cb828e.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/ironclad-logo-transparent-0d5f5cdbd3dcecaf95d1aef019a5ebee3122d169eaa68cec9258d6ead676eeff.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/posthog-logo-transparent-b066a8e28cc4bf30df2a8acb15871d6f78c0d4068c5b061656ab36f4594c582f.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/openai-logo-transparent-c650fb6bfd7073c21245510b8860f3d3d72fcf7a1ca3deed267af5a97f24616e.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/coinbase-logo-transparent-884b707305fbf3cc64e2fd880312ac0e30310b68b831c61bc47446daec352d28.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/instacart-logo-transparent-bd83ae5639098d164490c7c243fd295a25e8a54b3db1404d3c1a1242c3daaf11.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/faire-logo-transparent-5c0990582c0111c1bf5066c1b05c2081635e2d240633bf65cdd27b74a633c501.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/stripe-logo-transparent-85c767ab1ed5ba6d984910431da37aa11f0e491bbb5893620aeb9139112bc870.png" alt="" style={{height: "12vh"}}/>
                            <img src="https://bookface-static.ycombinator.com/assets/ycdc/logos/rippling-logo-transparent-491cdc4a31bbb5e0accd6699f3f3e38e1c8990b002db2dca9ee9c060a58b667f.png" alt="" style={{height: "12vh"}}/>
                        </div>
                    </div>):
                    (<div style={{fontSize: "3rem"}}>
                        {item.name}
                    </div>)}


            </motion.div>
        </>
    );
}




export const Scrolling = () => {
    const [activeData, setActiveData] = useState(null);

    const handleLeave = (index) => {
        if(index === 0){
            setActiveData(null); // this hides the images
        }
    }

    return (
        <div style={{ position: "relative", minHeight: "200vh" }}>
            <AnimatePresence>
                


                {activeData && activeData.name !== "VALUATION" && (
                    <>

                        {/* Left Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }} // Slide in from left
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -50 }}
                            style={{ position: 'fixed', left: '5%', top: "50%", y: "-50%", width: "400px", height: "auto" ,zIndex: 10 }}
                        >
                            <motion.img
                                key={activeData.leftImg}
                                src={activeData.leftImg}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                style={{ width: "100%", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                            />
                        </motion.div>


                        {/* Right Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }} // Slide in from right
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 50 }}
                            style={{ position: 'fixed', right: '5%', top: "50%", y: "-50%", width: "400px", height: 'auto',zIndex: 10 }}
                        >
                            <motion.img
                                key={activeData.rightImg}
                                src={activeData.rightImg}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                style={{ width: "100%", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                            />
                        </motion.div>
                        
                    </>
                )}


            </AnimatePresence>

            {/* Center Content */}
            <div className='items' style={{ width: "100%", position: "relative", zIndex: 4}}>
                {ViewStartup.map((item, index) => (
                    <StartupText 
                        key={index} 
                        item={item} 
                        onBecomeActive={() => setActiveData(item)}
                        onLeave={() => handleLeave(index)} 
                    />
                ))}
            </div>
        </div>
    );
}




