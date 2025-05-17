"use client";

import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [showMore, setShowMore] = useState(false);
    return (
        <ModalContext.Provider value={{ showMore, setShowMore }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    return useContext(ModalContext);
}