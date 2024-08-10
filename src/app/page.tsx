import HexMapContextMenu from "@/components/HexMapContextMenu";
import MapRenderer from "../renderer/HexMapRenderer";

export default function Home() {
    return (
        <div>
            <HexMapContextMenu>
                <MapRenderer />
            </HexMapContextMenu>
        </div>
    );
}
