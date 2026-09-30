import React, { useRef, useEffect, useState } from 'react';

export function NationalMap({ hospitals = [], selectedHospital, onHospitalSelect }) {
  const canvasRef = useRef(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw radar background grid lines
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw national healthcare corridor lines connecting facilities
    if (hospitals.length > 1) {
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      for (let i = 0; i < hospitals.length; i++) {
        for (let j = i + 1; j < hospitals.length; j++) {
          const h1 = hospitals[i];
          const h2 = hospitals[j];
          if (h1.position && h2.position) {
            ctx.beginPath();
            ctx.moveTo(h1.position.x * canvas.width, h1.position.y * canvas.height);
            ctx.lineTo(h2.position.x * canvas.width, h2.position.y * canvas.height);
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);
    }
  }, [hospitals]);

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {hospitals.map((h) => {
        const posX = (h.position?.x ?? 0.5) * 100;
        const posY = (h.position?.y ?? 0.5) * 100;
        const isSelected = selectedHospital?.id === h.id;

        return (
          <div
            key={h.id}
            className="hospital-marker"
            style={{
              position: 'absolute',
              left: `${posX}%`,
              top: `${posY}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 20 : 10,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHoveredMarker(h.id)}
            onMouseLeave={() => setHoveredMarker(null)}
            onClick={() => onHospitalSelect(h)}
          >
            <div className={`marker-dot ${h.status}`} style={{ transform: isSelected ? 'scale(1.3)' : 'scale(1)' }}>
              <i className="fa-solid fa-hospital" style={{ fontSize: '11px' }}></i>
            </div>

            {(hoveredMarker === h.id || isSelected) && (
              <div
                className="hospital-tooltip"
                style={{
                  position: 'absolute',
                  bottom: '125%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(10, 14, 39, 0.95)',
                  border: '1px solid var(--border-light)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-md)',
                  pointerEvents: 'none',
                  zIndex: 30,
                }}
              >
                <div className="font-bold text-xs text-primary">{h.name}</div>
                <div className="text-dim text-xs">
                  {h.region} • Occupancy: <strong>{h.occupancy}%</strong>
                </div>
                <div className="text-xs" style={{ color: h.status === 'critical' ? 'var(--danger)' : 'var(--success)' }}>
                  Status: {h.status.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
