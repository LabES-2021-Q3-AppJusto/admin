import { Box } from '@chakra-ui/react';
import * as menu from 'app/api/business/menu/functions';
import { useProductContext } from 'pages/menu/context/ProductContext';
import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { GroupBox } from './GroupBox';

export const Groups = () => {
  const { productConfig, updateProduct, sortedGroups } = useProductContext();
  // handlers
  const onDragEndComplements = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return; // dropped outside
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return; // same location
    }
    let newProductConfig = menu.empty();
    if (type === 'group') {
      newProductConfig = menu.updateFirstLevelIndex(productConfig, draggableId, destination.index);
    } else if (type === 'item') {
      newProductConfig = menu.updateSecondLevelIndex(
        productConfig,
        draggableId,
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index
      );
    }
    updateProduct({ changes: { complementsOrder: newProductConfig } });
  };

  // UI
  return (
    <DragDropContext onDragEnd={onDragEndComplements}>
      <Droppable droppableId="groups" type="group">
        {(droppable) => (
          <Box ref={droppable.innerRef} {...droppable.droppableProps} maxW="100%" overflowX="auto">
            {sortedGroups.map((group, index) => (
              <GroupBox key={group.name} index={index} group={group} />
            ))}
            {droppable.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};
