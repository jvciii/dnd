import type { CSSProperties, FC } from "react";
import React, { memo } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { DragItem, Item } from "./interfaces";
import { ItemTypes } from "./ItemTypes";
import { Colors } from "./Colors";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";
import type { DropTargetMonitor } from "react-dnd";
const style: CSSProperties = {
  border: "1px dashed gray",
  padding: "0.5rem 1rem",
  marginBottom: ".5rem",
  backgroundColor: "white",
  cursor: "move"
};
//
export interface CardProps {
  parentId: string;
  id: string;
  text: string;
  moveCard: (parentId: string, id: string, to: number, text?: string) => void;
  findCard: (id: string) => { card: any; index: number };
  addCard: (id: any) => void;
  removeCard: (parentId: string, id: string) => void;
}

export const Card: FC<CardProps> = memo(function Card(props) {
  const ref = useRef<HTMLDivElement>(null);
  const { card: originalCard, index: originalIndex } = props.findCard(props.id);

  const dragItem: Item = {
    parentId: props.parentId,
    id: props.id,
    originalIndex: originalIndex,
    text: props.text
  };

  const [{ isDragging, draggingItem }, drag] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item: dragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        draggingItem: monitor.getItem() as Item
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const { card } = props.findCard(droppedId);
        const didDrop = monitor.didDrop();
        dragItem.isTemp = false;
        // if (
        //   !didDrop &&
        //   card.parentId === "00000000-0000-0000-0000-000000000000"
        // ) {
        //   console.log("REMOVE");
        //   props.moveCard(card.parentId, card.id, originalIndex);
        // }

        if (didDrop && item.parentId !== item.tempParentId) {
          //props.removeCard("", item.id);
        }
      }
    }),
    [props.id, originalIndex, props.moveCard]
  );

  React.useEffect(() => {
    if (draggingItem)
      console.log(
        "isDragging",
        draggingItem.parentId,
        draggingItem.tempParentId
      );
    if (isDragging) {
      dragItem.isTemp = true;
    }
  }, [isDragging]);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.CARD],
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver()
      }),
      drop: (_item: Item, monitor) => {
        //console.log("Card dropped", _item);

        const x = props.findCard(_item.id);
        if (x && x.card.isTemp) {
          x.card.isTemp = false;
        }

        //console.log("EEE");
      },
      hover(draggedItem: Item) {
        if (draggedItem.isTemp) {
          console.log("DF");
        }

        if (draggedItem.id !== props.id) {
          const { card, index: overIndex } = props.findCard(props.id);
          if (card) {
            //console.log("Card found", draggedItem.id, overIndex);
            props.moveCard(
              card.parentId,
              draggedItem.id,
              overIndex,
              draggedItem.text
            );
          } else {
            console.log("Cleanup");
          }
        }
      }
    }),
    [props.findCard, props.moveCard]
  );

  useEffect(() => {
    //console.log("isOver", isOver);
    if (isOver) {
      //dragItem.tempParentId = props.parentId;
      // const x = props.findCard(draggingItem.id);
      // //console.log("XXXXXXXX", x, props.parentId);
      // if (x.card && x.card.isTemp && x.card.parentId !== props.parentId) {
      //   console.log("DELETE TEMPl");
      // }
      //console.log("card", draggingItem);
      //console.log("draggingItem", draggingItem);
      //(draggingItem as Item).id = "";
      //props.removeCard("", (draggingItem as Item).id);
    } else {
      if (originalCard && originalCard.tempParentId !== originalCard.parentId) {
        const xx = props.findCard(dragItem.id);
        //console.log("XX", draggingItem.parentId, draggingItem.tempParentId);
        if (xx) {
        }
        //dragItem.tempParentId = props.parentId;
        //console.log("#####D", dragItem);
      }

      //console.log("YY", draggingItem);
      // if (dragItem && dragItem.isTemp) {
      //   console.log(
      //     "XX",
      //     dragItem.parentId,
      //     props.parentId,
      //     dragItem.tempParentId
      //   );
      // }
    }
    //console.log("isOver2", isOver, draggingItem);
  }, [isOver, isDragging]);

  const opacity = isDragging ? 0.2 : 1;
  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      style={{ ...style, opacity }}
      title={`${props.parentId}`}
    >
      <span ref={ref}>{`${props.text}`}</span>
    </div>
  );
});
