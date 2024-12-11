// CustomPopup.tsx
import { Popup } from "react-leaflet";
import { useRef, useEffect } from "react";
import L from "leaflet";

interface CustomPopupProps {
    children: React.ReactNode;
    autoClose: boolean;
    minWidth: number;
    keepInView: boolean;
    onOpen?: () => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ children, onOpen, ...props }) => {
    const popupRef = useRef<L.Popup>(null);

    useEffect(() => {
        const popup = popupRef.current;
        if (popup && onOpen) {
        popup.on("add", onOpen);
        return () => {
            popup.off("add", onOpen);
        };
        }
    }, [onOpen]);

    return (
        <Popup ref={popupRef} {...props}>
        {children}
        </Popup>
    );
};

export default CustomPopup;