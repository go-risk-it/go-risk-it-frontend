import React, { useEffect, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import '../Map/SVGMap.css'; // Import the CSS file with player color classes


interface RegionDisplayProps {
  regionId: string;
  svgPath: string;
  troops?: number;
  ownerIndex: number;
}

const RegionDisplay: React.FC<RegionDisplayProps> = ({ regionId, svgPath, troops, ownerIndex }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && svgPath) {
      const svgElement = svgRef.current;
      const pathElement = svgElement.querySelector('path');
      if (pathElement) {
        const bbox = pathElement.getBBox();
        const padding = 5;
        const viewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
        svgElement.setAttribute('viewBox', viewBox);
      }
    }
  }, [svgPath]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <svg ref={svgRef} width="80" height="80" className="risk-it-map-container">
        <path
          d={svgPath}
          className={`risk-it-player${ownerIndex}`}
          stroke="#000"
          strokeWidth="1"
        />
      </svg>
      <Typography variant="subtitle2">{regionId}</Typography>
      {troops !== undefined && <Typography variant="body2">Troops: {troops}</Typography>}
    </Box>
  );
};

export default RegionDisplay;
