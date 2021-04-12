import React from 'react';


//actually I'm not going to use it, since the "loading" info look better on the button
// than on this component
export const Loading = () => {
    return(
        <div className="col-12">
            <span className="fa fa-spinner fa-pulse fa-3x fa-fw text-primary"></span>
            <p>Loading . . .</p>
        </div>
    );
};