import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import LayoutMapping from "./booth/LayoutMapping";
import { useRef } from "react";

const ZoomableExpoPreview = ({
  expoJson,
  expo,
  showEachBooth,
  setShowEachBooth,
}) => {
    const transformWrapperRef = useRef(null);

    // Function to zoom in
    const zoomIn = () => {
      if (transformWrapperRef.current) {
        transformWrapperRef.current.zoomIn();
      }
    };
  
    // Function to zoom out
    const zoomOut = () => {
      if (transformWrapperRef.current) {
        transformWrapperRef.current.zoomOut();
      }
    };
  
    // Function to reset the transform (zoom & position)
    const resetTransform = () => {
      if (transformWrapperRef.current) {
        transformWrapperRef.current.resetTransform();
      }
    };
  
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'black'
      }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit={true}
          ref={transformWrapperRef}  // Reference to access zoom methods
        >
          {() => (
            <>
              {/* Zoom Controls */}
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                display: 'flex',
                gap: '10px'
              }}>
                <button onClick={zoomIn}>Zoom In</button>
                <button onClick={zoomOut}>Zoom Out</button>
                <button onClick={resetTransform}>Reset</button>
              </div>
  
              {/* Zoomable Content */}
              <TransformComponent
                style={{
                  width: '100%', // Full width of TransformWrapper
                  height: '100%', // Full height of TransformWrapper
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {(expoJson && expo?.expType !== "Offline") ? (
                  <div className="w-full h-full object-contain flex  justify-center align-middle">
                    <LayoutMapping
                      showEachBooth={showEachBooth}
                      setShowEachBooth={setShowEachBooth}
                      expo={expo}
                      expoJson={expoJson}
                    />
                  </div>
                ) : (
                  <img
                    src="url('../assets/images/lobby-img.jpg')"
                    className="w-full h-full object-contain"
                    alt="Lobby"
                  />
                )}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    );
};

export default ZoomableExpoPreview;
