import HexMapContextMenu from "@/components/HexMapContextMenu";
import MapRenderer from "../renderer/HexMapRenderer";
import "../css/watermark.css"

export default function Home() {
    return (
        <div>
            <HexMapContextMenu>
                <MapRenderer />
            </HexMapContextMenu>
            <div className="two-minute-watermark">
                made with assets by https://2minutetabletop.com/
            </div>
        </div>
    );
}
