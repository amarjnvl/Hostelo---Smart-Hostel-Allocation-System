import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
    return (
        <div className="flex items-center justify-center">
            <motion.div
                role="status"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            >
                <span className="sr-only">Loading...</span>
            </motion.div>
        </div>
    );
};

export default Loader;
