import React from "react";

const Loader = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-b-2 border-blue-500 rounded-full" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Loader;
