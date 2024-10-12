import React, { useEffect, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface RegionDisplayProps {
  regionId: string;
  svgPath: string;
}

const RegionDisplay: React.FC<RegionDisplayProps> = ({ regionId, svgPath }) => {
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
    <Box display="flex" alignItems="center">
      <svg ref={svgRef} width="50" height="50">
        <path
          d={svgPath}
          fill="#ccc"
          stroke="#000"
          strokeWidth="1"
        />
      </svg>
      <Typography style={{ marginLeft: '10px' }}>{regionId}</Typography>
    </Box>
  );
};

export default RegionDisplay;
