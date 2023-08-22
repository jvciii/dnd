import { CSSProperties, FC, useRef } from "react";
import { memo, useCallback } from "react";
import useState from "react-usestateref";
import type { DropTargetMonitor } from "react-dnd";
import { useDrop } from "react-dnd";
import { Card } from "./Card";
import { Colors } from "./Colors";
import { DragItem, Item } from "./interfaces";
import { ItemTypes } from "./ItemTypes";
import { TextField, MaskedTextField } from "@fluentui/react/lib/TextField";
import { Stack, IStackProps, IStackStyles } from "@fluentui/react/lib/Stack";
import update from "immutability-helper";
import { useId } from "react";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
//
const style: CSSProperties = {
  border: "1px solid gray",
  padding: "2rem"
};

export interface TargetBoxProps {
  onDrop: (card: Item, cards: Item[]) => void;
  lastDroppedCard: Item | null;
  targetBoxId: string;
  cards: Item[];
}

export interface ContainerState {
  cards: Item[];
}

const TargetBox: FC<TargetBoxProps> = memo(function TargetBox(
  props: TargetBoxProps
) {
  const ref = useRef<HTMLDivElement>(null);
  const [cards, setCards, cardsRef] = useState<Item[]>([]);
  const lastHoveredOverTargetBox = useRef<TargetBoxProps>();
  const [newParent, setNewParent, newParentRef] = useState<boolean>(false);

  const addCard = useCallback((card: Item) => {
    //console.log("card", card);
    setCards((prevCards: Item[]) =>
      update(prevCards, {
        $push: [card]
      })
    );
  }, []);

  const findCard = useCallback(
    (id: string) => {
      const card = cardsRef.current.filter((c) => `${c.id}` === id)[0] as {
        parentId: string;
        id: string;
        text: string;
        tempParentId: string;
      };
      return {
        card,
        index: cardsRef.current.indexOf(card)
      };
    },
    [cards]
  );

  const moveCard = useCallback(
    (parentId: string, id: string, atIndex: number, text?: string) => {
      const { card, index } = findCard(id);
      if (index >= 0) {
        setCards(
          update(cards, {
            $splice: [
              [index, 1],
              [atIndex, 0, card]
            ]
          })
        );
      } else {
        const card: Item = {
          parentId: props.targetBoxId,
          id: id,
          text: text || "",
          isTemp: true
        };

        addCard(card);
      }
    },
    [findCard, cards, setCards]
  );

  const removeCard = useCallback(
    (parentId: string, id: string) => {
      const { card, index } = findCard(id);
      if (index >= 0) {
        setCards(
          update(cardsRef.current, {
            $splice: [[index, 1]]
          })
        );
      }
    },
    [findCard, cards, setCards]
  );

  const [{ isOver, draggingItem, canDrop }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.COMPONENT, ItemTypes.CARD],
      drop(_item: DragItem, monitor) {
        //console.log("DDD");
        //console.log("_item", _item);
        //console.log("droppedItem1", _item, cards);
        //console.log("originalCard", originalCard);
        const sourceType = monitor.getItemType();

        if (sourceType === "card") {
          if (
            _item.parentId !== lastHoveredOverTargetBox.current?.targetBoxId
          ) {
            //console.log("_item", _item);
            const c = { ..._item };
            //_item.parentId = "";
            c.parentId = lastHoveredOverTargetBox.current!.targetBoxId;
            c.text = _item.text + " CC";

            //const x = findCard(_item.id);
            //console.log("XX", x);
            //addCard(c);
          }
        }

        if (_item.id) {
          return;
        }

        // console.log("getItemType", monitor.getItemType());

        //console.log("props.targetBoxId", props.targetBoxId);
        const card: Item = {
          parentId: props.targetBoxId,
          id: uuidv4(),
          text: _item.text
        };

        addCard(card);

        props.onDrop(card, cards);
        return undefined;
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        draggingItem: monitor.getItem() as Item
      }),
      hover(item: DragItem, monitor) {
        const sourceType = monitor.getItemType();

        if (sourceType === "card") {
          lastHoveredOverTargetBox.current = props;
          if (
            item.tempParentId !== lastHoveredOverTargetBox.current!.targetBoxId
          ) {
            //setNewParent(true);
            // const c = findCard(item.id);
            // if (c && c.card) {
            //   c.card.tempParentId = lastHoveredOverTargetBox.current!.targetBoxId;
            // }
            //removeCard("", item.id);

            let tempIndex = -1;
            let tempId = "";
            console.log("parent id", props.targetBoxId);
            cardsRef.current.map((c, index) => {
              console.log("card", c);
              if (c.isTemp) {
                tempIndex = index;
                tempId = c.id;
              }
            });

            if (tempIndex >= 0) {
              removeCard("", tempId);
            }

            console.log("new Parent");
            item.tempParentId = lastHoveredOverTargetBox.current!.targetBoxId;
            //setNewParent(false);
          }
        }
      }
    }),
    [props.onDrop]
  );

  useEffect(() => {
    if (!newParentRef) return;
    console.log("new Parent");
  }, [newParentRef]);

  const opacity = isOver ? 1 : 0.7;
  let backgroundColor = "#fff";

  return (
    <div ref={drop} style={{ ...style, backgroundColor, opacity }}>
      {cards.length === 0 && <p>Drop here.</p>}

      <Stack>
        <span>{props.targetBoxId}</span>
        {cards?.map((card, index) => (
          <Card
            parentId={card.parentId}
            key={card.id}
            id={`${card.id}`}
            text={card.text}
            moveCard={moveCard}
            findCard={findCard}
            addCard={addCard}
            removeCard={removeCard}
          />
        ))}
      </Stack>
    </div>
  );
});

export interface StatefulTargetBoxState {
  cards?: Item[];
}

export const StatefulTargetBox: FC = (props: StatefulTargetBoxState) => {
  const ref = useRef<HTMLDivElement>(null);
  const targetBoxId = useRef<string>(uuidv4());
  const [cards, setCards] = useState<Item[]>(props.cards || []);
  const [lastDroppedCard, setLastDroppedCard] = useState<Item | null>(null);
  const handleDrop = useCallback((card: Item, _cards: Item[]) => {
    setLastDroppedCard(card);
    setCards(_cards);
    //console.log("cards", cards);
  }, []);

  return (
    <TargetBox
      {...props}
      lastDroppedCard={lastDroppedCard}
      onDrop={handleDrop}
      targetBoxId={targetBoxId.current}
      cards={cards}
    />
  );
};
