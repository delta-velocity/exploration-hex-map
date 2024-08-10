import HexMapContextMenu from '@/components/HexMapContextMenu';
import { GameMap } from '../p5sketches/objects/GameMap';
import MapRenderer from '../renderer/HexMapRenderer'

export default function Home() {
  return (
    <HexMapContextMenu>
        <MapRenderer />
    </HexMapContextMenu>
  );
}
