// import { useState } from 'react';
// import { listStartups } from './liststartups';
// import { Link } from 'react-router-dom';
// export const List = () => {



//     return(
//         <>
//             {listStartups.map((item, index) => {

//                 const {name, city, state, country, market, category, status, logo} = item;

//                 const tags = item.category ? item.category.split('|').filter(t => t.trim() !== "") : [];

//                 return(

//                         <div key={index} className='main-card'>
//                             <div className="logo-section">
//                                 <img src={logo} alt={`${name} logo`}/>
//                             </div>

//                             <div className="info-section">

//                                 <div className="row-1">
//                                     <span>
//                                         <h3>{name === "#WayWire" ?  
//                                         (<Link to='/startup-detail'>{name}</Link>) :
//                                         (name)}</h3>
//                                         {city}, {state}, {country}
//                                     </span>
//                                 </div>

//                                 {/* <div className="row-2">
//                                     <p>{market}</p>
//                                 </div> */}

//                                 <div className="row-3" style={{display: "flex", gap: "8px"}}>

//                                     <span className='status-tag'>
//                                         {status}
//                                     </span>

//                                     {tags.map((tag, index) => (
//                                         <span key={`${tag}-${index}`} className="tag">
//                                             {tag}
//                                         </span>
//                                     ))}

//                                 </div>

//                             </div>
//                         </div>
//                 )
//             })}
//         </>
//     )
// }


////




import { Link } from 'react-router-dom';
import { listStartups } from './liststartups';

export const List = () => {
  return (
    <>
      {listStartups.map((item, index) => {
        const { name, city, state, country, market, category, status, logo } = item;
        const tags = item.category
          ? item.category.split('|').filter(t => t.trim() !== '')
          : [];

        return (
          <Link
            key={index}
            to={`/startup-detail?name=${encodeURIComponent(name)}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div
              className="main-card"
              style={{ cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0d0d0d')}
              onMouseLeave={e => (e.currentTarget.style.background = '#000')}
            >
              <div className="logo-section">
                <img src={logo} alt={`${name} logo`} />
              </div>

              <div className="info-section">
                <div className="row-1">
                  <span>
                    <h3 style={{ color: '#f1f1f1', margin: '0 0 2px' }}>{name}</h3>
                    <span style={{ fontSize: 13, color: '#6b7280', fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      {[city, state, country].filter(Boolean).join(', ')}
                    </span>
                  </span>
                </div>

                <div className="row-3" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 6 }}>
                  <span className="status-tag">{status}</span>
                  {tags.map((tag, i) => (
                    <span key={`${tag}-${i}`} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Arrow hint */}
              <div style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center',
                color: '#ccc', fontSize: 18, fontFamily: '"IBM Plex Sans", sans-serif',
                paddingRight: 8,
              }}>
                →
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
};
