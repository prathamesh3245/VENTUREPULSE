import React from "react";
import { useState, useEffect } from "react";
import { NavBar } from "./navBar";
import { List } from "./list";

export const AllStartups = () => {

    const [startup, setStartup] = useState(null);

    return (
        <>
            <div className="listcontainer">
                <NavBar />
                <div className="heading2">
                    <p>Startup Directory</p>
                    <div className="thought2">
                        <p>Since 2005, we have invested in over 5,000 companies that have a combined valuation of over $1T. To find jobs at these startups, visit Work at a Startup.</p>
                    </div>
                </div>
            </div>

            <div className="directory-wrapper">


                <aside className="filters-sidebar">
                    <div className="filter-group">
                        <label>
                            <input type="checkbox" name="" id="" />Top Companies
                        </label>
                    </div>
                </aside>

                <main className="content-area">
                    <div className="search-container" style={{ width: "744px" }}>
                        <input type="text" placeholder="Search..." className="search-input" />
                    </div>
                    <div className="results-list">
                        <div className="startup-card">
                            <List />
                        </div>
                    </div>
                </main>


            </div>
        </>
    )

}