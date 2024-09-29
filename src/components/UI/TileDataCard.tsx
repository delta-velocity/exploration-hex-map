import { TileData } from "../../mapdata/MapData";
import "../../css/tileDataCard.css";

type TileDataCardProps = {
    tileData: TileData;
};

const preventSelect = (event: React.MouseEvent) => {
    event.preventDefault();
}

const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
}

export const TileDataCard: React.FC<TileDataCardProps> = ({ tileData }) => {
    return (
        <div className="tile-data-container" onClick={handleClick}>
            <div className="tile-data-card" onMouseDown={preventSelect}>
                <div>Tile Data</div>
                <div>{tileData.location.toString()}</div>
            </div>
            <div className="tile-data-pin"/>
        </div>
    );
};
