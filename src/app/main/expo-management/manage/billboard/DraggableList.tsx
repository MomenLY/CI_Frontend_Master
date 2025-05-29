import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FourteenMpIcon from '@mui/icons-material/FourteenMp';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const DraggableList = () => {
  const [items, setItems] = useState([
    { id: '1', content: 'Item 1', link: 'https://example.com/1' },
    { id: '2', content: 'Item 2', link: 'https://example.com/2' },
    { id: '3', content: 'Item 3', link: 'https://example.com/3' },
  ]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    setItems(reorderedItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center p-4 mb-2 bg-white border border-gray-300 rounded"
                    style={{
                      userSelect: 'none',
                      ...provided.draggableProps.style,
                    }}
                  >
                    {/* Drag Handle Icon */}
                    <span
                      className="cursor-move text-gray-500 mr-2"
                      {...provided.dragHandleProps} // Only apply dragHandleProps here
                    >
                      <FourteenMpIcon fontSize="large" />
                    </span>
                    {/* Item Content with a Link */}
                    <a
                      href={item.link}
                      className="flex-1 text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.content}
                    </a>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
